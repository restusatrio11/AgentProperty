import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { hasPermission, ACTIONS, RESOURCES } from "@/lib/rbac";

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

// POST: Reset another admin's password (Superadmin only)
export async function POST(request, { params }) {
  try {
    const { id: targetUserId } = params;
    const role = request.headers.get("x-user-role") || "ADMIN";
    const currentUserId = request.headers.get("x-user-id");

    if (!hasPermission(role, RESOURCES.USERS, ACTIONS.MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki izin untuk mereset password admin." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: "Password baru wajib disertakan." },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Akun admin tidak ditemukan." },
        { status: 404 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        passwordHash,
        requiresPasswordReset: true, // Force user to reset on next login
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    // Delete all sessions for the target user to force them to log out from all devices
    await prisma.session.deleteMany({
      where: { userId: targetUserId },
    }).catch(() => {});

    // Write audit log
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "127.0.0.1";
    let finalCreatorId = currentUserId;
    if (!finalCreatorId) {
      const creator = await prisma.user.findFirst({
        where: { role: "SUPERADMIN" },
      });
      finalCreatorId = creator?.id;
    }

    if (finalCreatorId) {
      await prisma.auditLog.create({
        data: {
          userId: finalCreatorId,
          actionType: "UPDATE",
          entityName: "User",
          entityId: targetUserId,
          changeSummary: `Mereset password akun admin: "${targetUser.email}" (memaksa ganti password pada login berikutnya)`,
          ipAddress: clientIp,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Password untuk admin ${targetUser.email} berhasil direset. Akun wajib mengatur ulang password pada login berikutnya.`,
    });
  } catch (error) {
    console.error("POST /api/auth/users/[id]/reset-password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat mereset password admin." },
      { status: 500 }
    );
  }
}
