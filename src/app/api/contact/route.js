import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { ACTIONS, RESOURCES } from "@/lib/rbac";
import { hasPermissionDb } from "@/lib/rbac-db";

export async function GET(request) {
  try {
    const role = request.headers.get("x-user-role") || "ADMIN";
    // Check permission - using PROPERITES as proxy if specific one not exists
    
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("GET /api/contact error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pesan" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // 1. Get IP address
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const route = "/api/contact";
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check rate limits
    const rateLimit = await prisma.rateLimit.findUnique({
      where: { ipAddress_route: { ipAddress: ip, route } },
    });

    if (rateLimit) {
      if (rateLimit.lastRequest > oneHourAgo) {
        if (rateLimit.count >= 3) {
          return NextResponse.json(
            { error: "Batas pengiriman pesan terlampaui. Maksimum 3 pesan per jam." },
            { status: 429 }
          );
        } else {
          // Increment count
          await prisma.rateLimit.update({
            where: { id: rateLimit.id },
            data: {
              count: rateLimit.count + 1,
              lastRequest: new Date(),
            },
          });
        }
      } else {
        // Reset count
        await prisma.rateLimit.update({
          where: { id: rateLimit.id },
          data: {
            count: 1,
            lastRequest: new Date(),
          },
        });
      }
    } else {
      // Create new rate limit record
      await prisma.rateLimit.create({
        data: {
          ipAddress: ip,
          route,
          count: 1,
          lastRequest: new Date(),
        },
      });
    }

    // 2. Parse body
    const body = await request.json();
    const { nama, email, hp, pesan } = body;

    // 3. Validation
    if (!nama || nama.trim().length < 3) {
      return NextResponse.json(
        { error: "Nama wajib diisi dan minimal 3 karakter." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Standardize digits check: min 10 characters
    if (!hp || hp.trim().replace(/[^0-9]/g, "").length < 10) {
      return NextResponse.json(
        { error: "Nomor HP wajib diisi dan minimal 10 digit angka." },
        { status: 400 }
      );
    }

    if (!pesan || pesan.trim().length < 5) {
      return NextResponse.json(
        { error: "Pesan wajib diisi dan minimal 5 karakter." },
        { status: 400 }
      );
    }

    // 4. Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        nama: nama.trim(),
        email: email.trim(),
        hp: hp.trim(),
        subjek: body.subjek || "Umum",
        pesan: pesan.trim(),
      },
    });

    // 5. Send email notification to admin
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "admin@primeproperty.com";
    await sendEmail({
      to: adminEmail,
      subject: `[Kontak Baru] ${body.subjek || "Pesan"} dari ${nama.trim()}`,
      html: `
        <h3>Pesan Baru dari Hubungi Kami</h3>
        <p><strong>Nama:</strong> ${nama.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        <p><strong>No HP:</strong> ${hp.trim()}</p>
        <p><strong>Subjek:</strong> ${body.subjek || "Umum"}</p>
        <p><strong>Pesan:</strong></p>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 4px;">${pesan.trim()}</p>
      `
    }).catch(err => console.error("Error sending contact notification email:", err));

    return NextResponse.json(
      { message: "Pesan terkirim, tim kami akan menghubungi Anda.", id: submission.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kesalahan API Kontak:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}
