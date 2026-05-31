import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hasPermission, ACTIONS, RESOURCES } from "@/lib/rbac";

// PATCH: Toggle active status or modify other admin fields (Superadmin only)
export async function PATCH(request, { params }) {
  try {
    const { id: targetUserId } = params;
    const role = request.headers.get("x-user-role") || "ADMIN";
    const currentUserId = request.headers.get("x-user-id");

    if (!hasPermission(role, RESOURCES.USERS, ACTIONS.MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki izin untuk mengedit akun admin." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { isActive, email, role: newRole, nama } = body;

    if (isActive === undefined && email === undefined && newRole === undefined && nama === undefined) {
      return NextResponse.json(
        { error: "Payload isActive, email, role, atau nama wajib disertakan." },
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

    const updateData = {};

    if (isActive !== undefined) {
      // Prevent self-deactivation
      if (currentUserId === targetUserId && !isActive) {
        return NextResponse.json(
          { error: "Anda tidak dapat menonaktifkan akun Anda sendiri." },
          { status: 400 }
        );
      }
      updateData.isActive = !!isActive;
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return NextResponse.json(
          { error: "Format email tidak valid." },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: targetUserId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email sudah digunakan oleh akun admin lain." },
          { status: 400 }
        );
      }

      updateData.email = normalizedEmail;
    }

    if (newRole !== undefined) {
      if (newRole !== "SUPERADMIN" && newRole !== "ADMIN") {
        return NextResponse.json(
          { error: "Role tidak valid. Harus SUPERADMIN atau ADMIN." },
          { status: 400 }
        );
      }

      // Prevent self-demotion
      if (currentUserId === targetUserId && targetUser.role === "SUPERADMIN" && newRole === "ADMIN") {
        return NextResponse.json(
          { error: "Anda tidak dapat menurunkan peran Superadmin Anda sendiri menjadi Admin." },
          { status: 400 }
        );
      }

      updateData.role = newRole;
    }

    if (nama !== undefined) {
      updateData.nama = nama.trim() || null;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    // If deactivated, force logout by deleting all active sessions
    if (isActive === false) {
      await prisma.session.deleteMany({
        where: { userId: targetUserId },
      }).catch(() => {});
    }

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
      let changesText = "";
      if (isActive !== undefined && targetUser.isActive !== !!isActive) {
        changesText += `Status: ${targetUser.isActive ? "Aktif" : "Nonaktif"} -> ${isActive ? "Aktif" : "Nonaktif"}. `;
      }
      if (email !== undefined && targetUser.email !== updateData.email) {
        changesText += `Email: "${targetUser.email}" -> "${updateData.email}". `;
      }
      if (newRole !== undefined && targetUser.role !== newRole) {
        changesText += `Role: "${targetUser.role}" -> "${newRole}". `;
      }
      if (nama !== undefined && targetUser.nama !== updateData.nama) {
        changesText += `Nama: "${targetUser.nama || "-"}" -> "${updateData.nama || "-"}". `;
      }

      if (changesText) {
        await prisma.auditLog.create({
          data: {
            userId: finalCreatorId,
            actionType: "UPDATE",
            entityName: "User",
            entityId: targetUserId,
            changeSummary: `Mengubah detail admin "${targetUser.email}": ${changesText}`,
            ipAddress: clientIp,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Akun admin berhasil diperbarui.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/auth/users/[id] error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat memperbarui admin." },
      { status: 500 }
    );
  }
}

// DELETE: Delete admin account (Superadmin only)
export async function DELETE(request, { params }) {
  try {
    const { id: targetUserId } = params;
    const role = request.headers.get("x-user-role") || "ADMIN";
    const currentUserId = request.headers.get("x-user-id");

    if (!hasPermission(role, RESOURCES.USERS, ACTIONS.MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki izin untuk menghapus akun admin." },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Anda sendiri." },
        { status: 400 }
      );
    }

    // Check if target user exists and get property counts
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        _count: {
          select: {
            propertiesCreated: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Akun admin tidak ditemukan." },
        { status: 404 }
      );
    }

    // Block deletion if they created property listings
    if (targetUser._count.propertiesCreated > 0) {
      return NextResponse.json(
        { 
          error: "Akun admin ini tidak dapat dihapus karena masih terdapat data properti yang didaftarkan atas namanya. Harap transfer kepemilikan properti tersebut ke admin lain terlebih dahulu atau nonaktifkan saja akun ini." 
        },
        { status: 400 }
      );
    }

    // Delete user (Prisma cascade will delete active sessions and audit logs)
    await prisma.user.delete({
      where: { id: targetUserId },
    });

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
          actionType: "DELETE",
          entityName: "User",
          entityId: targetUserId,
          changeSummary: `Menghapus akun admin secara permanen: "${targetUser.email}"`,
          ipAddress: clientIp,
        },
      });
    }

    return NextResponse.json({
      message: "Akun admin berhasil dihapus secara permanen.",
    });
  } catch (error) {
    console.error("DELETE /api/auth/users/[id] error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat menghapus admin." },
      { status: 500 }
    );
  }
}
