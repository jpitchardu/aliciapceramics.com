import type { SquareClient } from "square";

/*
 * Releasing seats (and shop pieces) nobody paid for.
 *
 * Checkout moves what's being bought from in stock to sold the moment the
 * Square payment link is made, so two people can't buy the last seat. If the
 * buyer walks away, nothing ever puts it back — the link just sits there
 * unpaid. This finds the site's links that are older than HOLD_MINUTES and
 * still unpaid, and for each one:
 *
 *  1. clears the order's metadata, so the order-cancelled webhook (which
 *     restores stock from that metadata) can't give the stock back twice
 *  2. deletes the payment link, which cancels its order and kills the link
 *  3. moves the held quantity from sold back to in stock
 *
 * Links made before RELEASE_SINCE predate this and are left alone — old shop
 * links whose pieces were settled by hand.
 */

export const HOLD_MINUTES = 30;
export const RELEASE_SINCE = "2026-10-16T00:00:00Z";
/* the page and checkout call this often; one sweep per few minutes is plenty */
const THROTTLE_MS = 5 * 60 * 1000;

let lastSweep = 0;

export type Released = { linkId: string; orderId: string; quantity: number };

export async function releaseStaleHolds(
  client: SquareClient,
  opts: { now?: Date; force?: boolean } = {},
): Promise<Released[]> {
  const now = opts.now ?? new Date();
  if (!opts.force && now.getTime() - lastSweep < THROTTLE_MS) return [];
  lastSweep = now.getTime();

  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) return [];

  const cutoff = now.getTime() - HOLD_MINUTES * 60 * 1000;
  const since = Date.parse(RELEASE_SINCE);
  const stale: { id: string; orderId: string }[] = [];
  const page = await client.checkout.paymentLinks.list({ limit: 100 });
  for await (const link of page) {
    const made = Date.parse(link.createdAt ?? "");
    if (!link.id || !link.orderId || Number.isNaN(made)) continue;
    if (made >= since && made <= cutoff) {
      stale.push({ id: link.id, orderId: link.orderId });
    }
  }
  if (!stale.length) return [];

  const { orders = [] } = await client.orders.batchGet({
    locationId,
    orderIds: stale.map((s) => s.orderId),
  });
  const byId = new Map(orders.map((o) => [o.id, o]));

  const released: Released[] = [];
  for (const { id, orderId } of stale) {
    const order = byId.get(orderId);
    // only unpaid orders: a paid one moves on from DRAFT
    if (!order || order.state !== "DRAFT") continue;
    const meta = (order.metadata ?? {}) as Record<string, string>;
    const ids = (meta.variationIds ?? "").split(",").filter(Boolean);
    if (!ids.length) continue;
    const qtys = (meta.variationQuantities ?? "").split(",");

    try {
      await client.orders.update({
        orderId,
        order: { locationId, version: order.version },
        fieldsToClear: ["metadata"],
      });
    } catch (err) {
      // without this the webhook could restore it too — leave it be
      console.error(`[holds] couldn't clear order ${orderId}:`, err);
      continue;
    }
    try {
      await client.checkout.paymentLinks.delete({ id });
      await client.inventory.batchCreateChanges({
        idempotencyKey: `release-${orderId}`,
        changes: ids.map((variationId, i) => ({
          type: "ADJUSTMENT",
          adjustment: {
            catalogObjectId: variationId,
            locationId,
            fromState: "SOLD",
            toState: "IN_STOCK",
            quantity: qtys[i] || "1",
            occurredAt: now.toISOString(),
          },
        })),
      });
      released.push({
        linkId: id,
        orderId,
        quantity: ids.reduce((s, _, i) => s + (Number(qtys[i]) || 1), 0),
      });
    } catch (err) {
      console.error(`[holds] couldn't release order ${orderId}:`, err);
    }
  }
  if (released.length) {
    console.log("[holds] released unpaid holds:", released);
  }
  return released;
}

/* for tests */
export const resetHoldThrottle = () => {
  lastSweep = 0;
};
