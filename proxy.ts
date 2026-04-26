import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "homeworks_session";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;

  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/child");

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/child/:path*"],
};
