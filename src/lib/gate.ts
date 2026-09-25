import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BYPASS_COOKIE, SHOP_CLOSED } from "@/lib/config";

/*
 * The middleware doesn't run on /api, so API routes that expose the shop
 * (catalog, checkout) check the closed flag themselves. Returns a 503 to send
 * back while the shop is closed, or null to carry on. The preview bypass
 * cookie still gets through.
 */
export async function shopClosedResponse(): Promise<NextResponse | null> {
  if (!SHOP_CLOSED) return null;
  const bypassKey = process.env.GATE_BYPASS_KEY;
  const bypassed =
    !!bypassKey && (await cookies()).get(BYPASS_COOKIE)?.value === "1";
  if (bypassed) return null;
  return NextResponse.json({ error: "shop is closed" }, { status: 503 });
}
