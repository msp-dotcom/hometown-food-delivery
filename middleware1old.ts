import { NextRequest, NextResponse } from "next/server";
import { getExpectedAdminToken } from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let the login page and its own API routes through untouched
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = req.cookies.get("admin_token")?.value;
    const expected = await getExpectedAdminToken();

    if (!token || token !== expected) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
