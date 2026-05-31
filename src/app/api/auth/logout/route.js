// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function POST(request) {
  const sessionCookie = request.cookies.get("session")?.value;
  if (sessionCookie) {
    try {
      const decoded = await verifyJWT(sessionCookie);
      if (decoded && decoded.sessionId) {
        await prisma.session.delete({
          where: { id: decoded.sessionId }
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Logout DB cleanup failed:", error);
    }
  }

  const response = NextResponse.json({ success: true, message: "Logout berhasil." });
  
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}

export async function GET(request) {
  const sessionCookie = request.cookies.get("session")?.value;
  if (sessionCookie) {
    try {
      const decoded = await verifyJWT(sessionCookie);
      if (decoded && decoded.sessionId) {
        await prisma.session.delete({
          where: { id: decoded.sessionId }
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Logout DB cleanup failed:", error);
    }
  }

  const response = NextResponse.redirect(new URL("/agent/login", request.url));
  
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
