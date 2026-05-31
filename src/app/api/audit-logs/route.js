import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Role check
    const role = request.headers.get("x-user-role") || request.cookies.get("user_role")?.value || "ADMIN";
    if (role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses audit log hanya untuk Superadmin" }, { status: 403 });
    }

    // Fetch audit logs with user email
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/audit-logs error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
