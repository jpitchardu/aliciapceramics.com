import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";
import { bulkOrderSchema, countPieces } from "@/lib/wholesale";
import { findBulkCode, isProduction } from "@/lib/wholesale-codes";

/*
 * Receives a bulk order. Validation is real; delivery isn't wired up yet —
 * the plan is to open a draft order in Square and notify alicia, who accepts
 * or declines and invoices from there. Until then production refuses the
 * order (so nobody is told it was received when it wasn't) and every other
 * environment accepts it as a dry run so the flow can be walked end to end.
 */
export async function POST(req: Request) {
  const parsed = bulkOrderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const order = parsed.data;
  if (!findBulkCode(order.code)) {
    return NextResponse.json({ error: "unknown code" }, { status: 403 });
  }

  const pieces = countPieces(order.lines);
  await track("bulk_order_submitted", {
    pieces,
    lines: order.lines.length,
  }).catch(() => {});

  // TODO(square): create the draft order + notify alicia here.
  if (isProduction()) {
    return NextResponse.json(
      { error: "bulk orders aren't connected yet" },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, dryRun: true, pieces });
}
