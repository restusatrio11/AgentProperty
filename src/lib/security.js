import prisma from "@/lib/prisma";

/**
 * Checks if a request from a specific IP should be allowed based on rate limits.
 * @param {string} ip - Client IP address
 * @param {string} route - The route or key for rate limiting (e.g., 'global_limit')
 * @param {number} limit - Maximum allowed requests per minute
 * @returns {Promise<{allowed: boolean, count: number}>}
 */
export async function checkRateLimit(ip, route = "global_limit", limit = 100) {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        ipAddress_route: {
          ipAddress: ip,
          route,
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
          route,
        },
      },
      update: {
        count: count,
        lastRequest: now,
      },
      create: {
        ipAddress: ip,
        route,
        count: count,
        lastRequest: now,
      },
    });

    return {
      allowed: count <= limit,
      count,
    };
  } catch (error) {
    console.error("Rate Limit logic error:", error);
    // Fail open in dev/local to avoid blocking user if DB setup has issues
    return { allowed: true, count: 0 };
  }
}
