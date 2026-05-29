import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DROP } from "@/lib/config";

const OPEN_AT = new Date(DROP.opensAt).getTime();
const BYPASS_KEY = process.env.GATE_BYPASS_KEY;
const BYPASS_COOKIE = "gate_bypass";

const GATED = ["/shop", "/cart", "/order-confirmed"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // set bypass cookie when ?bypass=<key> matches
  if (BYPASS_KEY && searchParams.get("bypass") === BYPASS_KEY) {
    const dest = request.nextUrl.clone();
    dest.searchParams.delete("bypass");
    const res = NextResponse.redirect(dest);
    res.cookies.set(BYPASS_COOKIE, BYPASS_KEY, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  }

  // bypass cookie lets you through regardless of open time
  const bypassCookie = request.cookies.get(BYPASS_COOKIE);
  if (BYPASS_KEY && bypassCookie?.value === BYPASS_KEY) {
    return NextResponse.next();
  }

  // shop is open — no gate
  if (Date.now() >= OPEN_AT) return NextResponse.next();

  // always allow the countdown page itself
  if (pathname === "/") return NextResponse.next();

  // redirect all gated routes to countdown
  const isGated = GATED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!isGated) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|assets|icons|favicon).*)"],
};
