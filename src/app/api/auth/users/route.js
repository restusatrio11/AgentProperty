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

// GET: List all users (Superadmin only)
export async function GET(request) {
  try {
    const role = request.headers.get("x-user-role") || "ADMIN";
    
    if (!hasPermission(role, RESOURCES.USERS, ACTIONS.MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki izin untuk melihat daftar admin." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        isActive: true,
        requiresPasswordReset: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("GET /api/auth/users error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}

// POST: Create a new admin (Superadmin only)
export async function POST(request) {
  try {
    const role = request.headers.get("x-user-role") || "ADMIN";
    const creatorId = request.headers.get("x-user-id");

    if (!hasPermission(role, RESOURCES.USERS, ACTIONS.MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki izin untuk membuat admin baru." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { nama, email, password, role: targetRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        nama: nama ? nama.trim() : null,
        email: normalizedEmail,
        passwordHash,
        role: targetRole || "ADMIN",
        isActive: true,
        requiresPasswordReset: true,
      },
    });

    // Write audit log
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "127.0.0.1";
    
    // Find a fallback creator ID if header is missing
    let finalCreatorId = creatorId;
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
          actionType: "CREATE",
          entityName: "User",
          entityId: newUser.id,
          changeSummary: `Membuat akun admin baru: "${newUser.email}"`,
          ipAddress: clientIp,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Akun admin berhasil dibuat.",
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
          requiresPasswordReset: newUser.requiresPasswordReset,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/users error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat membuat admin." },
      { status: 500 }
    );
  }
}
