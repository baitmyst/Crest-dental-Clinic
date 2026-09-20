import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "crest-dental-secret-key-2026-uganda-kampala-production-grade"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect Admin Dashboard Pages & Admin API Routes
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get("staff_session")?.value;

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized access to clinic staff API" }, { status: 401 });
    }
    const loginUrl = new URL("/staff/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);

    // If route requires ADMIN role, verify role
    const isAdminOnlyPage =
      pathname.startsWith("/admin/staff") ||
      pathname.startsWith("/admin/settings") ||
      pathname.startsWith("/admin/audit-logs");

    if (isAdminOnlyPage && payload.role !== "ADMIN") {
      if (isAdminApi) {
        return NextResponse.json({ error: "Forbidden: Administrator role required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Invalid or expired token
    if (isAdminApi) {
      return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
    }
    const loginUrl = new URL("/staff/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
