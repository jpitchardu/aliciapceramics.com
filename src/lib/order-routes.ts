import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";
import {
  codeRequestSchema,
  countPieces,
  orderSchemaFor,
  type OrderKind,
} from "@/lib/wholesale";
import { findCode, isProduction } from "@/lib/wholesale-codes";
import { squareClient } from "@/lib/square";
import {
  createSquareBulkOrder,
  hasSquareCredentials,
} from "@/lib/wholesale-square";

/*
 * The two endpoints behind each order flow (/api/wholesale/*,
 * /api/commission/*), which differ only in their code and rules.
 */

const EVENT: Record<OrderKind, string> = {
  wholesale: "bulk_order",
  commission: "commission",
};

/* Unlocks a flow: the right code returns the estimated completion date;
 * anything else is a quiet "not found". */
export async function handleCodeRequest(kind: OrderKind, req: Request) {
  const parsed = codeRequestSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const code = findCode(kind, parsed.data.code);
  if (!code) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }
  return NextResponse.json({ valid: true, code });
}

/*
 * Receives an order and turns it into a customer, an order and a draft
 * invoice in Square for alicia to accept or decline. Without Square
 * credentials (local dev), production refuses the order so nobody is told it
 * was received when it wasn't, and anywhere else runs a dry run.
 */
export async function handleOrderRequest(kind: OrderKind, req: Request) {
  const parsed = orderSchemaFor(kind).safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const order = parsed.data;
  const code = findCode(kind, order.code);
  if (!code) {
    return NextResponse.json({ error: "unknown code" }, { status: 403 });
  }

  const pieces = countPieces(order.lines);
  const track_ = (name: string, extra: Record<string, string | number> = {}) =>
    track(`${EVENT[kind]}_${name}`, {
      pieces,
      lines: order.lines.length,
      ...extra,
    }).catch(() => {});

  if (!hasSquareCredentials()) {
    await track_("submitted", { mode: "dry_run" });
    if (isProduction()) {
      return NextResponse.json(
        { error: "orders aren't connected yet" },
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
      kind,
    );
    await track_("submitted", { mode: "square" });
    return NextResponse.json({ ok: true, pieces, orderId, invoiceId });
  } catch (err) {
    console.error(`[${kind}] square order failed:`, err);
    await track_("failed");
    return NextResponse.json(
      { error: "couldn't create the order" },
      { status: 502 },
    );
  }
}
