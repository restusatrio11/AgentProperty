// src/middleware.js
import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth";
import { hasPermission, mapRequestToPermission } from "./lib/rbac";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // 1. Define routes that don't need authentication
  const isPublicContactApi = pathname === "/api/contact";
  const isPublicPropertiesApi = pathname === "/api/properties" && method === "GET";
  const isPublicTestimonialsApi = pathname === "/api/testimonials" && method === "GET";
  const isAgentLogin = pathname === "/agent/login";
  const isLoginApi = pathname === "/api/auth/login";
  const isVerifySessionApi = pathname === "/api/auth/verify-session";
  const isResetPasswordApi = pathname === "/api/auth/reset-password";

  // Get Client IP
  const xForwardedFor = request.headers.get("x-forwarded-for");
  const ip = xForwardedFor ? xForwardedFor.split(",")[0].trim() : "127.0.0.1";

  // 0. Global Rate Limiting (AC-9.2) - 100 req/min
  // We only rate limit API and Agent routes to avoid slowing down static assets too much
  if ((pathname.startsWith("/api") || pathname.startsWith("/agent")) && !pathname.startsWith("/api/security")) {
    try {
      const rlRes = await fetch(`${request.nextUrl.origin}/api/security/rate-limit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, limit: 100 }),
      });
      if (rlRes.status === 429) {
        return NextResponse.json(
          { error: "Too Many Requests: Batas limit global (100 req/menit) tercapai." },
          { status: 429 }
        );
      }
    } catch (err) {
      console.error("Rate limit check failed:", err);
    }
  }

  // 0. CSRF Protection for Mutations (AC-9.2)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    // Basic CSRF check: Origin must match Host
    if (origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { error: "Forbidden: CSRF protection triggered. Origin mismatch." },
          { status: 403 }
        );
      }
    } else if (pathname.startsWith("/api") && !isLoginApi && !isPublicContactApi && !isVerifySessionApi && !pathname.startsWith("/api/security")) {
      // For API routes (except public ones), require Origin or Referer from our own site
      const referer = request.headers.get("referer");
      if (referer) {
        const refererHost = new URL(referer).host;
        if (refererHost !== host) {
           return NextResponse.json(
            { error: "Forbidden: CSRF protection triggered. Referer mismatch." },
            { status: 403 }
          );
        }
      } else {
        // No origin and no referer for a mutation? Suspect.
        return NextResponse.json(
          { error: "Forbidden: CSRF protection triggered. Missing origin/referer." },
          { status: 403 }
        );
      }
    }
  }

  // 2. Read the session cookie and perform stateful check
  const sessionCookie = request.cookies.get("session")?.value;
  let decodedToken = null;
  let isAuthenticated = false;
  let dynamicPermissions = null;

  if (sessionCookie) {
    decodedToken = await verifyJWT(sessionCookie);
    if (decodedToken) {
      // Stateful verification
      try {
        const origin = request.nextUrl.origin;
        const verifyRes = await fetch(`${origin}/api/auth/verify-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: sessionCookie }),
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.isValid) {
            isAuthenticated = true;
            dynamicPermissions = verifyData.permissions;
            // Update decodedToken with actual DB info
            decodedToken = {
              ...decodedToken,
              role: verifyData.user.role,
              email: verifyData.user.email,
              requiresPasswordReset: verifyData.user.requiresPasswordReset,
            };
          }
        }
      } catch (err) {
        console.error("Middleware session verification failed:", err);
        isAuthenticated = false;
      }
    }
  }

  // 3. Clear invalid/expired cookie and redirect/reject
  if (sessionCookie && !isAuthenticated) {
    let response;
    if (pathname.startsWith("/api")) {
      response = NextResponse.json(
        { error: "Unauthorized: Session invalid atau telah kedaluwarsa." },
        { status: 401 }
      );
    } else {
      response = NextResponse.redirect(new URL("/agent/login", request.url));
    }
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
    return response;
  }

  // 4. Handle /agent page routing
  if (pathname.startsWith("/agent")) {
    if (isAgentLogin) {
      if (isAuthenticated) {
        if (decodedToken.requiresPasswordReset) {
          return NextResponse.redirect(new URL("/agent/reset-password", request.url));
        }
        return NextResponse.redirect(new URL("/agent/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/agent/login", request.url));
    }

    // Force user to reset password if required
    if (decodedToken.requiresPasswordReset && pathname !== "/agent/reset-password") {
      return NextResponse.redirect(new URL("/agent/reset-password", request.url));
    }

    if (pathname === "/agent") {
      if (decodedToken.requiresPasswordReset) {
        return NextResponse.redirect(new URL("/agent/reset-password", request.url));
      }
      return NextResponse.redirect(new URL("/agent/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 5. Handle /api route protection
  if (pathname.startsWith("/api")) {
    if (isPublicContactApi || isLoginApi || isVerifySessionApi || isResetPasswordApi || isPublicPropertiesApi || isPublicTestimonialsApi) {
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized: Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // RBAC Check
    const permission = mapRequestToPermission(method, pathname);
    
    // If a permission is mapped, check if the user has it
    if (permission) {
      const { resource, action } = permission;
      const userRole = decodedToken.role;

      if (!hasPermission(userRole, resource, action, dynamicPermissions)) {
        return NextResponse.json(
          { error: `Forbidden: Akses ditolak. Role ${userRole} tidak memiliki izin untuk ${action} pada ${resource}.` },
          { status: 403 }
        );
      }
    }

    // Pass user info to route handlers via headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-role", decodedToken.role);
    requestHeaders.set("x-user-email", decodedToken.email);
    requestHeaders.set("x-user-id", decodedToken.userId || decodedToken.id || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/agent/:path*", "/api/:path*"],
};
