import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/lib/env";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import type { UserRole } from "@/generated/prisma";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup", 
  "/auth/error",
  "/auth/verify-request",
  "/api/auth",
  "/api/health",
];

// Route permission mappings
const ROUTE_PERMISSIONS: Record<string, { resource: string; action: string }> = {
  "/dashboard": { resource: "system", action: "read" },
  "/patients": { resource: "patients", action: "read" },
  "/appointments": { resource: "appointments", action: "read" },
  "/medical-records": { resource: "medical_records", action: "read" },
  "/staff": { resource: "staff", action: "read" },
  "/admin": { resource: "system", action: "admin" },
  "/pharmacy": { resource: "pharmacy", action: "read" },
  "/billing": { resource: "billing", action: "read" },
  "/reports": { resource: "reports", action: "read" },
  "/audit": { resource: "audit_logs", action: "read" },
};

/**
 * Checks if a route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Gets required permission for a route
 */
function getRoutePermission(pathname: string): { resource: string; action: string } | null {
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return permission;
    }
  }
  return null;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get user session
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    });

    // Redirect to sign-in if not authenticated
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user account is active and verified
    if (!token.isVerified && pathname !== "/auth/verify") {
      return NextResponse.redirect(new URL("/auth/verify", request.url));
    }

    // Check route permissions
    const requiredPermission = getRoutePermission(pathname);
    if (requiredPermission) {
      const userRole = token.role as UserRole;
      
      if (!hasPermission(userRole, requiredPermission)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // Add user context to request headers for downstream consumption
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", token.userId as string);
    requestHeaders.set("x-user-role", token.role as string);
    requestHeaders.set("x-user-email", token.email as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};