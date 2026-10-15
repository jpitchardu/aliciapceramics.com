import { NextResponse } from "next/server";
import { squareClient } from "@/lib/square";
import { releaseStaleHolds } from "@/lib/holds";

/*
 * A daily backstop for releasing unpaid holds — the class pages and class
 * checkout also sweep as they're used. Vercel's cron sends the CRON_SECRET
 * as a bearer token when one is set.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    return NextResponse.json({ released: [] });
  }
  try {
    const released = await releaseStaleHolds(squareClient, { force: true });
    return NextResponse.json({ released });
  } catch (err) {
    console.error("[cron] release holds failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
