import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { squareClient } from "@/lib/square";

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

  const state = (
    orderUpdated?.order_updated as Record<string, unknown> | undefined
  )?.state;

  if (state !== "CANCELED") {
    return NextResponse.json({ ok: true });
  }

  const orderId = (
    orderUpdated?.order_updated as Record<string, unknown> | undefined
  )?.order_id as string | undefined;

  if (!orderId) {
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
    const rawIds = (order?.metadata as Record<string, string> | undefined)
      ?.variationIds;

    if (!rawIds) {
      return NextResponse.json({ ok: true });
    }

    const variationIds = rawIds.split(",").filter(Boolean);
    if (variationIds.length === 0) {
      return NextResponse.json({ ok: true });
    }

    await squareClient.inventory.batchCreateChanges({
      idempotencyKey: crypto.randomUUID(),
      changes: variationIds.map((variationId) => ({
        type: "PHYSICAL_COUNT",
        physicalCount: {
          catalogObjectId: variationId,
          locationId,
          state: "IN_STOCK",
          quantity: "1",
          occurredAt: new Date().toISOString(),
        },
      })),
    });

    console.log(
      `[webhook] restored inventory for order ${orderId}:`,
      variationIds,
    );
  } catch (err) {
    console.error("[webhook] error restoring inventory:", err);
    return NextResponse.json({ error: "restore failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
