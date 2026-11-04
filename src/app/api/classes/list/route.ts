import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";
import { squareClient } from "@/lib/square";
import { isProduction } from "@/lib/wholesale-codes";
import { hasSquareCredentials } from "@/lib/wholesale-square";
import { addToClassList, classListSchema } from "@/lib/class-list";

/*
 * "Tell me when the next class goes up." Puts the email in Square's
 * "class list" customer group. Without Square credentials (local dev) it's
 * a dry run; production refuses rather than say it saved when it didn't.
 */
export async function POST(req: Request) {
  const parsed = classListSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const s = parsed.data;
  const event = (name: string, extra: Record<string, string> = {}) =>
    track(name, { from: s.from, ...extra }).catch(() => {});

  if (!hasSquareCredentials()) {
    await event("class_list_signup", { mode: "dry_run" });
    if (isProduction()) {
      return NextResponse.json({ error: "not connected" }, { status: 503 });
    }
    return NextResponse.json({ ok: true, dryRun: true });
  }

  try {
    await addToClassList(squareClient, s);
    await event("class_list_signup", { mode: "square" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[class list] square signup failed:", err);
    await event("class_list_failed");
    return NextResponse.json({ error: "couldn't save" }, { status: 502 });
  }
}
