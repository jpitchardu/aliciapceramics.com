import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DROP } from "@/lib/config";

const OPEN_AT = new Date(DROP.opensAt).getTime();
const BYPASS_COOKIE = "gate_bypass";

const GATED = ["/shop", "/cart", "/order-confirmed"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Read per-request so the Edge Runtime picks it up correctly
  const bypassKey = process.env.GATE_BYPASS_KEY;

  // set bypass cookie when ?bypass=<key> matches
  if (bypassKey && searchParams.get("bypass") === bypassKey) {
    const dest = request.nextUrl.clone();
    dest.searchParams.delete("bypass");
    const res = NextResponse.redirect(dest);
    res.cookies.set(BYPASS_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return res;
  }

  // bypass cookie lets you through regardless of open time
  // The key is only needed to SET the cookie; checking just the value is sufficient
  const bypassCookie = request.cookies.get(BYPASS_COOKIE);
  if (bypassCookie?.value === "1") {
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
