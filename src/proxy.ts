import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const COOKIE_NAME = "rivera_admin_token";

export const config = {
  matcher: ["/admin/:path*"],
};

export function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const isLoginPage = pathname === "/admin/login";

  if (!isLoginPage) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}
