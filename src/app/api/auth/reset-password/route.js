// src/app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { verifyJWT, signJWT } from "@/lib/auth";

function validatePasswordStrength(password) {
  if (password.length < 8) {
    return "Password minimal harus 8 karakter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password harus mengandung minimal satu huruf kecil.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password harus mengandung minimal satu huruf besar.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password harus mengandung minimal satu angka.";
  }
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    return "Password harus mengandung minimal satu karakter spesial (seperti !, @, #, $, %, dll).";
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const tempToken = body.tempToken;
    const newPassword = body.newPassword;

    const token = tempToken || request.cookies.get("session")?.value;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token reset dan password baru wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Validate the token
    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: "Token reset tidak valid atau telah kedaluwarsa." },
        { status: 400 }
      );
    }

    const userId = decoded.id;

    // 2. Validate password strength
    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return NextResponse.json(
        { error: strengthError },
        { status: 400 }
      );
    }

    // 3. Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Akun Anda telah dinonaktifkan. Silakan hubungi Superadmin." },
        { status: 403 }
      );
    }

    // 4. Hash new password and update user record
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        requiresPasswordReset: false,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    // 5. Delete all old sessions for this user (force logout from other devices)
    await prisma.session.deleteMany({
      where: { userId },
    }).catch(() => {});

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "127.0.0.1";

    // 6. Write audit log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        actionType: "UPDATE",
        entityName: "User",
        entityId: userId,
        changeSummary: `Pengguna ${updatedUser.email} berhasil memperbarui password mereka.`,
        ipAddress: ipAddress,
      },
    });

    // 7. Create new active session so user remains logged in
    const sessionToken = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const userAgent = request.headers.get("user-agent") || "Unknown Browser";

    const session = await prisma.session.create({
      data: {
        userId: updatedUser.id,
        token: sessionToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    const jwtToken = await signJWT({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      requiresPasswordReset: false,
      sessionId: session.id,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password berhasil diatur ulang. Anda kini masuk ke dashboard.",
    });

    response.cookies.set("session", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}
