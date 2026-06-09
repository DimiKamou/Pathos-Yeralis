import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-edge";

// Gate /admin behind the signed session cookie. /admin/login + the admin auth
// API stay public. Storefront + storefront APIs are untouched (guest-first).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // In development the admin is left open so it's instantly explorable with no
  // login. Production (npm run build/start, Vercel, Firebase) always enforces
  // the session below.
  if (process.env.NODE_ENV !== "production") return NextResponse.next();
  const isLogin = pathname === "/admin/login";
  const isAuthApi = pathname.startsWith("/api/admin/login") || pathname.startsWith("/api/admin/logout");
  if (isLogin || isAuthApi) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
