// src/app/api/auth/verify-session/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { getDynamicPermissions } from "@/lib/rbac-db";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body.token || request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ isValid: false, error: "No token provided" }, { status: 400 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.sessionId || !decoded.id) {
      return NextResponse.json({ isValid: false, error: "Invalid token structure" });
    }

    const sessionId = decoded.sessionId;
    const userId = decoded.id;

    // Fetch session and associated user
    const dbSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!dbSession) {
      return NextResponse.json({ isValid: false, error: "Session not found in database" });
    }

    if (dbSession.userId !== userId) {
      return NextResponse.json({ isValid: false, error: "Session user mismatch" });
    }

    const now = new Date();
    if (dbSession.expiresAt < now) {
      // Delete expired session
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      return NextResponse.json({ isValid: false, error: "Session has expired" });
    }

    // Check if user is active
    if (!dbSession.user || !dbSession.user.isActive) {
      // Revoke all sessions for this user
      await prisma.session.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ isValid: false, error: "User is inactive" });
    }

    const permissions = await getDynamicPermissions();

    return NextResponse.json({
      isValid: true,
      user: {
        id: dbSession.user.id,
        email: dbSession.user.email,
        role: dbSession.user.role,
        isActive: dbSession.user.isActive,
        requiresPasswordReset: dbSession.user.requiresPasswordReset,
      },
      permissions,
    });
  } catch (error) {
    console.error("Error in verify-session API:", error);
    return NextResponse.json({ isValid: false, error: "Internal server error" }, { status: 500 });
  }
}
