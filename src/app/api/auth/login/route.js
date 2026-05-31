// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { verifyJWT, signJWT } from "@/lib/auth";

function getClientIp(request) {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || request.ip || "127.0.0.1";
}

async function recordIpFailure(ipAddress) {
  const rateLimit = await prisma.rateLimit.findUnique({
    where: {
      ipAddress_route: {
        ipAddress,
        route: "login_lockout"
      }
    }
  });

  const now = new Date();
  let newCount = 1;
  if (rateLimit) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (rateLimit.lastRequest < thirtyMinutesAgo) {
      newCount = 1;
    } else {
      newCount = rateLimit.count + 1;
    }
  }

  await prisma.rateLimit.upsert({
    where: {
      ipAddress_route: {
        ipAddress,
        route: "login_lockout"
      }
    },
    update: {
      count: newCount,
      lastRequest: now
    },
    create: {
      ipAddress,
      route: "login_lockout",
      count: newCount,
      lastRequest: now
    }
  });

  return newCount;
}

export async function POST(request) {
  try {
    const { email, password, captchaToken, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 0. Verify Google reCAPTCHA
    if (!captchaToken) {
      return NextResponse.json(
        { error: "Verifikasi Captcha wajib diisi." },
        { status: 400 }
      );
    }

    try {
      const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
      const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`, {
        method: "POST",
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        return NextResponse.json(
          { error: "Verifikasi Captcha gagal. Silakan coba lagi." },
          { status: 400 }
        );
      }
    } catch (err) {
      console.error("reCAPTCHA verification error:", err);
      return NextResponse.json(
        { error: "Gagal memverifikasi Captcha. Silakan periksa koneksi server." },
        { status: 500 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const ipAddress = getClientIp(request);
    const now = new Date();

    // 1. Verify IP-based lockout
    const ipRateLimit = await prisma.rateLimit.findUnique({
      where: {
        ipAddress_route: {
          ipAddress,
          route: "login_lockout"
        }
      }
    });

    if (ipRateLimit && ipRateLimit.count >= 10) {
      const elapsedMs = now.getTime() - ipRateLimit.lastRequest.getTime();
      if (elapsedMs < 15 * 60 * 1000) {
        const remainingMs = 15 * 60 * 1000 - elapsedMs;
        const remainingMin = Math.floor(remainingMs / 60000);
        const remainingSec = Math.ceil((remainingMs % 60000) / 1000);

        let timeString = "";
        if (remainingMin > 0) {
          timeString += `${remainingMin} menit `;
        }
        timeString += `${remainingSec} detik`;

        return NextResponse.json(
          { error: `Terlalu banyak percobaan login gagal dari IP Anda. Silakan coba lagi dalam ${timeString}.` },
          { status: 429 }
        );
      } else {
        // IP lockout has expired -> delete record
        await prisma.rateLimit.delete({
          where: { id: ipRateLimit.id }
        }).catch(() => {});
      }
    }

    // 2. Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      await recordIpFailure(ipAddress);
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 3. Verify user-based lockout
    const isUserLockedOut = user.lockoutUntil && user.lockoutUntil > now;
    if (isUserLockedOut) {
      const remainingMs = user.lockoutUntil.getTime() - now.getTime();
      const remainingMin = Math.floor(remainingMs / 60000);
      const remainingSec = Math.ceil((remainingMs % 60000) / 1000);

      let timeString = "";
      if (remainingMin > 0) {
        timeString += `${remainingMin} menit `;
      }
      timeString += `${remainingSec} detik`;

      return NextResponse.json(
        { error: `Akun Anda terkunci karena terlalu banyak percobaan login. Silakan coba lagi dalam ${timeString}.` },
        { status: 423 }
      );
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordValid) {
      // Check if user is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: "Akun Anda telah dinonaktifkan. Silakan hubungi Superadmin." },
          { status: 403 }
        );
      }

      // Successful login -> Reset failed attempts and lockout in user model
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      });

      // Reset IP-based rateLimit
      await prisma.rateLimit.delete({
        where: {
          ipAddress_route: {
            ipAddress,
            route: "login_lockout"
          }
        }
      }).catch(() => {});

      // Create session in the database (active for both normal and reset password flow)
      const sessionToken = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // session duration based on rememberMe
      const durationDays = rememberMe ? 30 : 1;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      const userAgent = request.headers.get("user-agent") || "Unknown Browser";

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          ipAddress,
          userAgent,
          expiresAt,
        },
      });

      // Generate JWT payload with sessionId linked to DB session id
      const token = await signJWT({
        id: user.id,
        email: user.email,
        role: user.role,
        requiresPasswordReset: user.requiresPasswordReset,
        sessionId: session.id,
      }, durationDays);

      // Set cookie and respond
      const response = NextResponse.json({
        success: true,
        message: user.requiresPasswordReset
          ? "Anda wajib mengatur ulang password Anda sebelum melanjutkan."
          : "Login berhasil.",
        requiresPasswordReset: user.requiresPasswordReset,
        user: {
          email: user.email,
          role: user.role,
        },
      });

      response.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: durationDays * 24 * 60 * 60,
        path: "/",
      });

      response.cookies.set("user_role", user.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: durationDays * 24 * 60 * 60,
        path: "/",
      });

      // Clear captcha cookie
      response.cookies.delete("captcha");

      return response;
    } else {
      // Invalid password -> Calculate/increment user failed login attempts
      const isUserLockoutExpired = user.lockoutUntil && user.lockoutUntil <= now;
      let newAttempts = user.failedLoginAttempts;
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      if (isUserLockoutExpired || user.updatedAt < thirtyMinutesAgo) {
        newAttempts = 1;
      } else {
        newAttempts += 1;
      }

      let newLockoutUntil = null;
      if (newAttempts >= 5) {
        newLockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      }

      // Save failed attempt status to User DB
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockoutUntil: newLockoutUntil,
        },
      });

      // Track failed attempt for IP in RateLimit DB
      const newIpCount = await recordIpFailure(ipAddress);

      let errorMessage = "Email atau password salah.";
      if (newIpCount >= 10) {
        errorMessage = "IP Anda diblokir sementara karena terlalu banyak percobaan login yang gagal.";
      } else if (newLockoutUntil) {
        errorMessage = "Akun Anda terkunci sementara karena terlalu banyak percobaan login yang gagal.";
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}
