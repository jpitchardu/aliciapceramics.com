import { NextResponse } from "next/server";
import { codeRequestSchema } from "@/lib/wholesale";
import { findBulkCode } from "@/lib/wholesale-codes";

/* Unlocks the bulk-order flow: a known code returns the shop's name and the
 * earliest completion date; anything else is a quiet "not found". */
export async function POST(req: Request) {
  const parsed = codeRequestSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const code = findBulkCode(parsed.data.code);
  if (!code) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }
  return NextResponse.json({ valid: true, code });
}
