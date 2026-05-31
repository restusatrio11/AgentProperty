import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDynamicPermissions, hasPermissionDb } from "@/lib/rbac-db";
import { RESOURCES, ACTIONS } from "@/lib/rbac";

// GET: Retrieve the roles permission matrix (Superadmin only)
export async function GET(request) {
  try {
    const role = request.headers.get("x-user-role") || "ADMIN";

    if (!await hasPermissionDb(role, RESOURCES.USERS, ACTIONS.MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki izin untuk melihat konfigurasi otorisasi." },
        { status: 403 }
      );
    }

    const permissions = await getDynamicPermissions();

    // Return the matrix, resources and actions
    const metadata = {
      resources: [
        { name: "properties", label: "Listing Properti" },
        { name: "users", label: "Manajemen Pengguna & Sesi" },
        { name: "audit_logs", label: "Log Audit Sistem" },
        { name: "testimonials", label: "Kelola Testimoni" },
        { name: "messages", label: "Pesan Kontak Masuk" }
      ],
      actions: [
        { name: "read", label: "View (Membaca)" },
        { name: "create", label: "Create (Menambah)" },
        { name: "update", label: "Update (Mengubah)" },
        { name: "delete", label: "Delete (Menghapus)" },
        { name: "manage", label: "Manage (Mengelola)" }
      ]
    };

    return NextResponse.json({
      permissions,
      metadata
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/auth/roles error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}

// PUT: Update the roles permission matrix (Superadmin only)
export async function PUT(request) {
  try {
    const role = request.headers.get("x-user-role") || "ADMIN";
    const creatorId = request.headers.get("x-user-id");

    if (!await hasPermissionDb(role, RESOURCES.USERS, ACTIONS.MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki izin untuk mengubah konfigurasi otorisasi." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { permissions } = body; // Expected structure: { SUPERADMIN: { properties: [...] }, ADMIN: { ... } }

    if (!permissions || typeof permissions !== "object") {
      return NextResponse.json(
        { error: "Payload permissions tidak valid." },
        { status: 400 }
      );
    }

    // Loop through keys and upsert into DB
    const rolesToUpdate = Object.keys(permissions);
    
    // Safety check: Prevent Superadmin from locking themselves out of managing permissions
    if (permissions.SUPERADMIN) {
      const superadminUsersPerm = permissions.SUPERADMIN.users || [];
      if (!superadminUsersPerm.includes("manage")) {
        return NextResponse.json(
          { error: "Kesalahan Keamanan: Superadmin wajib memiliki izin 'manage' pada 'users' agar tidak mengunci diri sendiri dari pengaturan ini." },
          { status: 400 }
        );
      }
    }

    for (const targetRole of rolesToUpdate) {
      await prisma.rolePermission.upsert({
        where: { role: targetRole },
        update: {
          permissionsJson: JSON.stringify(permissions[targetRole])
        },
        create: {
          role: targetRole,
          permissionsJson: JSON.stringify(permissions[targetRole])
        }
      });
    }

    // Write audit log
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "127.0.0.1";
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
          actionType: "UPDATE",
          entityName: "RolePermission",
          entityId: "SYSTEM_MATRIX",
          changeSummary: "Memperbarui matriks otorisasi RBAC (hak akses dinamis untuk role SUPERADMIN & ADMIN)",
          ipAddress: clientIp,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Matriks otorisasi RBAC berhasil diperbarui."
    }, { status: 200 });

  } catch (error) {
    console.error("PUT /api/auth/roles error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat menyimpan otorisasi." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a role from the permission matrix
export async function DELETE(request) {
  try {
    const role = request.headers.get("x-user-role") || "ADMIN";
    const creatorId = request.headers.get("x-user-id");

    if (!await hasPermissionDb(role, RESOURCES.USERS, ACTIONS.MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki izin untuk menghapus role." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roleToDelete = searchParams.get("role");

    if (!roleToDelete) {
      return NextResponse.json({ error: "Role yang akan dihapus tidak ditentukan." }, { status: 400 });
    }

    if (roleToDelete === "SUPERADMIN" || roleToDelete === "ADMIN") {
      return NextResponse.json({ error: "Role sistem utama (SUPERADMIN/ADMIN) tidak dapat dihapus." }, { status: 400 });
    }

    // Check if any users are currently assigned to this role
    const usersWithRole = await prisma.user.count({
      where: { role: roleToDelete }
    });

    if (usersWithRole > 0) {
      return NextResponse.json(
        { error: `Tidak dapat menghapus role karena masih ada ${usersWithRole} pengguna yang menggunakan role ini.` },
        { status: 400 }
      );
    }

    await prisma.rolePermission.delete({
      where: { role: roleToDelete }
    });

    // Write audit log
    if (creatorId) {
      const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "127.0.0.1";
      await prisma.auditLog.create({
        data: {
          userId: creatorId,
          actionType: "DELETE",
          entityName: "RolePermission",
          entityId: roleToDelete,
          changeSummary: `Menghapus role kustom: "${roleToDelete}"`,
          ipAddress: clientIp,
        },
      });
    }

    return NextResponse.json({ success: true, message: `Role ${roleToDelete} berhasil dihapus.` });
  } catch (error) {
    console.error("DELETE /api/auth/roles error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
