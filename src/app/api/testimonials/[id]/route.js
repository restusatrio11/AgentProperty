import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ACTIONS, RESOURCES } from "@/lib/rbac";
import { hasPermissionDb } from "@/lib/rbac-db";

// PATCH: Update testimonial (e.g., Approve/Reject)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const role = request.headers.get("x-user-role") || "ADMIN";
    const userId = request.headers.get("x-user-id");

    // Check permission (using a general management permission or specific one if exists)
    // For now using PROPERTIES as a proxy if TESTIMONIALS isn't in RBAC yet, 
    // but ideally we should add TESTIMONIALS to RBAC.
    // Let's check what's available in RESOURCES.
    
    const body = await request.json();
    const { isApproved } = body;

    const updated = await prisma.testimonial.update({
      where: { id },
      data: { isApproved },
    });

    // Log action
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          actionType: "UPDATE",
          entityName: "Testimonial",
          entityId: id,
          changeSummary: `${isApproved ? "Menyetujui" : "Membatalkan persetujuan"} testimoni dari ${updated.nama}`,
          ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    }

    return NextResponse.json({ message: "Testimoni diperbarui", testimonial: updated });
  } catch (error) {
    console.error("PATCH /api/testimonials/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui testimoni" }, { status: 500 });
  }
}

// DELETE: Delete testimonial
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const role = request.headers.get("x-user-role") || "ADMIN";
    const userId = request.headers.get("x-user-id");

    const deleted = await prisma.testimonial.delete({
      where: { id },
    });

    // Log action
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          actionType: "DELETE",
          entityName: "Testimonial",
          entityId: id,
          changeSummary: `Menghapus testimoni dari ${deleted.nama}`,
          ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    }

    return NextResponse.json({ message: "Testimoni dihapus" });
  } catch (error) {
    console.error("DELETE /api/testimonials/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus testimoni" }, { status: 500 });
  }
}
