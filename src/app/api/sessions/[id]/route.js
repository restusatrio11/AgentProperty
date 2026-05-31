// src/app/api/sessions/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    const { id: sessionId } = params;

    if (!sessionId) {
      return NextResponse.json({ error: "ID sesi tidak valid atau kosong." }, { status: 400 });
    }

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized: Silakan login terlebih dahulu." }, { status: 401 });
    }

    const decoded = await verifyJWT(sessionCookie);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Unauthorized: Token tidak valid." }, { status: 401 });
    }

    // Role check - restrict to SUPERADMIN only
    if (decoded.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden: Hanya Superadmin yang dapat mencabut akses sesi." }, { status: 403 });
    }

    // Find the session to verify existence and gather info for audit logs
    const sessionToRevoke = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!sessionToRevoke) {
      return NextResponse.json({ error: "Sesi tidak ditemukan atau sudah tidak aktif." }, { status: 404 });
    }

    // Delete session from DB
    await prisma.session.delete({
      where: { id: sessionId },
    });

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "127.0.0.1";

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: decoded.id,
        actionType: "DELETE",
        entityName: "Session",
        entityId: sessionId,
        changeSummary: `Memaksa logout (Hapus Akses) sesi milik ${sessionToRevoke.user.email} (IP: ${sessionToRevoke.ipAddress || "-"}, Device: ${sessionToRevoke.userAgent || "-"})`,
        ipAddress: clientIp,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akses sesi untuk ${sessionToRevoke.user.email} berhasil dicabut.`,
    });
  } catch (error) {
    console.error("DELETE /api/sessions/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
