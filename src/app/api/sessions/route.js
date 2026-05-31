// src/app/api/sessions/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Parser to turn raw User-Agent strings into friendly browser names
function getFriendlyUserAgent(ua) {
  if (!ua) return "Perangkat Tidak Dikenal";
  
  const lower = ua.toLowerCase();
  
  // OS checks
  let os = "";
  if (lower.includes("windows nt")) os = "Windows";
  else if (lower.includes("macintosh") || lower.includes("mac os x")) os = "macOS";
  else if (lower.includes("iphone")) os = "iPhone";
  else if (lower.includes("ipad")) os = "iPad";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("linux")) os = "Linux";
  else os = "Perangkat Desktop";

  // Browser checks
  let browser = "";
  if (lower.includes("edg/")) {
    const match = ua.match(/Edg\/([0-9]+)/);
    browser = `Microsoft Edge ${match ? match[1] : ""}`;
  } else if (lower.includes("opr/") || lower.includes("opera/")) {
    browser = "Opera";
  } else if (lower.includes("chrome") && lower.includes("safari")) {
    const match = ua.match(/Chrome\/([0-9]+)/);
    browser = `Chrome ${match ? match[1] : ""}`;
  } else if (lower.includes("firefox")) {
    const match = ua.match(/Firefox\/([0-9]+)/);
    browser = `Firefox ${match ? match[1] : ""}`;
  } else if (lower.includes("safari") && !lower.includes("chrome")) {
    const match = ua.match(/Version\/([0-9.]+)/);
    browser = `Safari ${match ? match[1] : ""}`;
  } else if (lower.includes("msie") || lower.includes("trident/")) {
    browser = "Internet Explorer";
  } else {
    browser = "Browser Kustom / Unknown";
  }

  return `${browser} (${os})`;
}

export async function GET(request) {
  try {
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
      return NextResponse.json({ error: "Forbidden: Akses khusus Superadmin." }, { status: 403 });
    }

    // Fetch all active sessions
    const activeSessions = await prisma.session.findMany({
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

    const parsedSessions = activeSessions.map((session) => {
      const isCurrent = session.id === decoded.sessionId;
      return {
        id: session.id,
        email: session.user.email,
        role: session.user.role,
        rawUserAgent: session.userAgent || "Unknown User Agent",
        deviceName: getFriendlyUserAgent(session.userAgent),
        ipAddress: session.ipAddress || "127.0.0.1",
        loginTime: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        isCurrent,
      };
    });

    return NextResponse.json({ sessions: parsedSessions }, { status: 200 });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
