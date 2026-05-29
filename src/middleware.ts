import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DROP } from "@/lib/config";

const OPEN_AT = new Date(DROP.opensAt).getTime();

export function middleware(request: NextRequest) {
  const now = Date.now();
  if (now >= OPEN_AT) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // allow the countdown page itself and all non-storefront routes
  if (pathname === "/") return NextResponse.next();

  // gate all storefront routes
  const gated = ["/shop", "/cart", "/order-confirmed"];
  const isGated = gated.some(
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
