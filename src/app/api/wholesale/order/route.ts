import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";
import { bulkOrderSchema, countPieces } from "@/lib/wholesale";
import { findBulkCode, isProduction } from "@/lib/wholesale-codes";
import { squareClient } from "@/lib/square";
import {
  createSquareBulkOrder,
  isSquareOrderingOn,
} from "@/lib/wholesale-square";

/*
 * Receives a bulk order. With WHOLESALE_SQUARE_ORDERS=on (and Square
 * credentials) it becomes a customer, an order and a draft invoice in Square
 * for alicia to accept or decline. Without it, production refuses the order
 * (so nobody is told it was received when it wasn't) and every other
 * environment runs a dry run so the flow can be walked end to end.
 */
export async function POST(req: Request) {
  const parsed = bulkOrderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const order = parsed.data;
  const code = findBulkCode(order.code);
  if (!code) {
    return NextResponse.json({ error: "unknown code" }, { status: 403 });
  }

  const pieces = countPieces(order.lines);
  const track_ = (name: string, extra: Record<string, string | number> = {}) =>
    track(name, { pieces, lines: order.lines.length, ...extra }).catch(
      () => {},
    );

  if (!isSquareOrderingOn()) {
    await track_("bulk_order_submitted", { mode: "dry_run" });
    if (isProduction()) {
      return NextResponse.json(
        { error: "bulk orders aren't connected yet" },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true, dryRun: true, pieces });
  }

  try {
    const { orderId, invoiceId } = await createSquareBulkOrder(
      squareClient,
      order,
      code,
      order.submissionId,
    );
    await track_("bulk_order_submitted", { mode: "square" });
    return NextResponse.json({ ok: true, pieces, orderId, invoiceId });
  } catch (err) {
    console.error("[wholesale] square order failed:", err);
    await track_("bulk_order_failed");
    return NextResponse.json(
      { error: "couldn't create the order" },
      { status: 502 },
    );
  }
}
