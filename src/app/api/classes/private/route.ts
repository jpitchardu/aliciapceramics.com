import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";
import { squareClient } from "@/lib/square";
import { isProduction } from "@/lib/wholesale-codes";
import { hasSquareCredentials } from "@/lib/wholesale-square";
import {
  createSquarePrivateRequest,
  privateRequestSchema,
} from "@/lib/private-requests";

/*
 * Receives a private event request and puts it in Square as a draft for
 * alicia. Without Square credentials (local dev) it's a dry run; production
 * refuses rather than say it was received when it wasn't.
 */
export async function POST(req: Request) {
  const parsed = privateRequestSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const r = parsed.data;
  const event = (name: string, extra: Record<string, string | number> = {}) =>
    track(name, { place: r.place, guests: r.guests, ...extra }).catch(() => {});

  if (!hasSquareCredentials()) {
    await event("private_request_submitted", { mode: "dry_run" });
    if (isProduction()) {
      return NextResponse.json({ error: "not connected" }, { status: 503 });
    }
    return NextResponse.json({ ok: true, dryRun: true });
  }

  try {
    const ids = await createSquarePrivateRequest(squareClient, r);
    await event("private_request_submitted", { mode: "square" });
    return NextResponse.json({ ok: true, ...ids });
  } catch (err) {
    console.error("[private] square request failed:", err);
    await event("private_request_failed");
    return NextResponse.json({ error: "couldn't send" }, { status: 502 });
  }
}
