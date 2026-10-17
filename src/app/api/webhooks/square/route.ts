import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { squareClient } from "@/lib/square";
import { heldUnits, isSoftHold } from "@/lib/holds";

const SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ?? "";
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/square`;

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !SIGNATURE_KEY) return false;
  const expected = createHmac("sha256", SIGNATURE_KEY)
    .update(WEBHOOK_URL + rawBody)
    .digest("base64");
  return expected === signature;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (event.type !== "order.updated") {
    return NextResponse.json({ ok: true });
  }

  const orderUpdated = (event.data as Record<string, unknown> | undefined)
    ?.object as Record<string, unknown> | undefined;

  const updated = orderUpdated?.order_updated as
    | Record<string, unknown>
    | undefined;
  const state = updated?.state;
  const orderId = updated?.order_id as string | undefined;

  // a cancelled order gives back what checkout took out of stock. Paid
  // orders need nothing: square moves their items to sold itself
  if (state !== "CANCELED" || !orderId) {
    return NextResponse.json({ ok: true });
  }

  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) {
    return NextResponse.json(
      { error: "store not configured" },
      { status: 500 },
    );
  }

  try {
    const { order } = await squareClient.orders.get({ orderId });
    const metadata = order?.metadata as Record<string, string> | undefined;
    // Older orders (placed before quantities were tracked) fall back to 1.
    const units = heldUnits(metadata);
    if (units.length === 0) {
      return NextResponse.json({ ok: true });
    }
    // a soft hold (classes) never left the stock — nothing to give back
    if (isSoftHold(metadata)) {
      return NextResponse.json({ ok: true });
    }

    // Undo the IN_STOCK → SOLD hold made at checkout, so pieces bought in
    // bulk get all of their stock back. Square won't move SOLD back to
    // IN_STOCK, so the units come back as NONE → IN_STOCK.
    await squareClient.inventory.batchCreateChanges({
      idempotencyKey: crypto.randomUUID(),
      changes: units.map(([variationId, n]) => ({
        type: "ADJUSTMENT",
        adjustment: {
          catalogObjectId: variationId,
          locationId,
          fromState: "NONE",
          toState: "IN_STOCK",
          quantity: String(n),
          occurredAt: new Date().toISOString(),
        },
      })),
    });

    console.log(`[webhook] restored inventory for order ${orderId}:`, units);
  } catch (err) {
    console.error("[webhook] error updating inventory:", err);
    return NextResponse.json({ error: "inventory failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
