import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-edge";

// Gate /admin behind the signed session cookie. /admin/login + the admin auth
// API stay public. Storefront + storefront APIs are untouched (guest-first).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF defense: for state-changing /api/admin/* requests (non GET/HEAD/OPTIONS)
  // reject browser cross-site calls by comparing the Origin host to the request
  // host. Absent Origin (same-origin server-to-server, curl) is allowed. Runs
  // before the dev-open gate and the auth check so it always applies.
  if (pathname.startsWith("/api/admin/") && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    if (origin) {
      const host = req.headers.get("host") || req.nextUrl.host;
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = "";
      }
      if (originHost !== host) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  // The admin is left open ONLY for true local development (next dev →
  // NODE_ENV=development) or an explicit opt-in (ADMIN_DEV_OPEN=1). A deployed
  // next start (production), staging, or unset NODE_ENV is always gated below.
  const devOpen = process.env.ADMIN_DEV_OPEN === "1" || process.env.NODE_ENV === "development";
  if (devOpen) return NextResponse.next();
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
