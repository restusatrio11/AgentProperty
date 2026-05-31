import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { ip, limit = 100 } = await request.json();

    if (!ip) {
      return NextResponse.json({ error: "Missing IP" }, { status: 400 });
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Using the existing RateLimit model
    // route will be "global_limit"
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        ipAddress_route: {
          ipAddress: ip,
          route: "global_limit",
        },
      },
    });

    let count = 1;
    if (rateLimit) {
      if (rateLimit.lastRequest < oneMinuteAgo) {
        count = 1;
      } else {
        count = rateLimit.count + 1;
      }
    }

    await prisma.rateLimit.upsert({
      where: {
        ipAddress_route: {
          ipAddress: ip,
          route: "global_limit",
        },
      },
      update: {
        count: count,
        lastRequest: now,
      },
      create: {
        ipAddress: ip,
        route: "global_limit",
        count: count,
        lastRequest: now,
      },
    });

    if (count > limit) {
      return NextResponse.json({ allowed: false, count }, { status: 429 });
    }

    return NextResponse.json({ allowed: true, count }, { status: 200 });
  } catch (error) {
    console.error("Global Rate Limit Error:", error);
    // Fail open to avoid blocking users if DB is down, but log it
    return NextResponse.json({ allowed: true, error: "Internal error" }, { status: 200 });
  }
}
