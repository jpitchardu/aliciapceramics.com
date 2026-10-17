import type { Order, SquareClient } from "square";

/*
 * Holding stock while someone pays, and letting go when they don't.
 *
 * Two kinds of hold, told apart by the order's metadata:
 *
 *  - soft (classes): stock isn't touched at checkout. The unpaid order is
 *    the hold — seats left are what's in stock minus the seats in the
 *    site's unpaid orders younger than HOLD_MINUTES (heldSeats). Once paid,
 *    Square moves them from in stock to sold itself. Releasing one is just
 *    deleting its payment link, so nobody pays after the hold ran out.
 *
 *  - hard (shop): checkout moves the pieces from in stock to sold at once.
 *    Square then sells them again when the order is paid, so a paid hard
 *    hold counts twice — the shop should move to soft holds too.
 *    Releasing one clears the order's metadata (so the order-cancelled
 *    webhook can't restore it twice), deletes the link, and adds the
 *    pieces back to in stock. Square won't move SOLD back to IN_STOCK —
 *    nor via RETURNED_BY_CUSTOMER — so NONE → IN_STOCK is the way back.
 *
 * Links made before RELEASE_SINCE predate this and are left alone — old shop
 * links whose pieces were settled by hand.
 */

export const HOLD_MINUTES = 30;
export const RELEASE_SINCE = "2026-10-16T00:00:00Z";
/* the order metadata flag that marks a soft hold */
export const SOFT_HOLD = { hold: "soft" } as const;
/* the page and checkout call this often; one sweep per few minutes is plenty */
const THROTTLE_MS = 5 * 60 * 1000;

let lastSweep = 0;

type Meta = Record<string, string>;
const metaOf = (o: Order) => (o.metadata ?? {}) as Meta;
export const isSoftHold = (meta: Meta | undefined) =>
  meta?.hold === SOFT_HOLD.hold;

/* the variations an order holds and how many of each, from its metadata */
export function heldUnits(meta: Meta | undefined): [string, number][] {
  const ids = (meta?.variationIds ?? "").split(",").filter(Boolean);
  const qtys = (meta?.variationQuantities ?? "").split(",");
  return ids.map((id, i) => [id, Number(qtys[i]) || 1]);
}

/* the site's payment links made in [from, to], with their orders */
async function linksBetween(
  client: SquareClient,
  locationId: string,
  from: number,
  to: number,
) {
  const links: { id: string; orderId: string }[] = [];
  const page = await client.checkout.paymentLinks.list({ limit: 100 });
  for await (const link of page) {
    const made = Date.parse(link.createdAt ?? "");
    if (!link.id || !link.orderId || Number.isNaN(made)) continue;
    if (made >= from && made <= to) {
      links.push({ id: link.id, orderId: link.orderId });
    }
  }
  if (!links.length) return [];
  const { orders = [] } = await client.orders.batchGet({
    locationId,
    orderIds: links.map((l) => l.orderId),
  });
  const byId = new Map(orders.map((o) => [o.id, o]));
  return links.map((l) => ({ ...l, order: byId.get(l.orderId) }));
}

/*
 * Seats held by soft-hold checkouts that are unpaid and still inside their
 * HOLD_MINUTES — variation id → quantity. Never throttled: checkout needs
 * the live number.
 */
export async function heldSeats(
  client: SquareClient,
  opts: { now?: Date } = {},
): Promise<Map<string, number>> {
  const held = new Map<string, number>();
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) return held;
  const now = (opts.now ?? new Date()).getTime();
  const from = Math.max(
    Date.parse(RELEASE_SINCE),
    now - HOLD_MINUTES * 60 * 1000,
  );
  for (const { order } of await linksBetween(client, locationId, from, now)) {
    // a paid order moves on from DRAFT, and its seats are sold
    if (order?.state !== "DRAFT" || !isSoftHold(metaOf(order))) continue;
    for (const [id, n] of heldUnits(metaOf(order))) {
      held.set(id, (held.get(id) ?? 0) + n);
    }
  }
  return held;
}

export type Released = { linkId: string; orderId: string; quantity: number };

/* lets go of every unpaid hold older than HOLD_MINUTES */
export async function releaseStaleHolds(
  client: SquareClient,
  opts: { now?: Date; force?: boolean } = {},
): Promise<Released[]> {
  const now = opts.now ?? new Date();
  if (!opts.force && now.getTime() - lastSweep < THROTTLE_MS) return [];
  lastSweep = now.getTime();

  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) return [];

  const stale = await linksBetween(
    client,
    locationId,
    Date.parse(RELEASE_SINCE),
    now.getTime() - HOLD_MINUTES * 60 * 1000,
  );

  const released: Released[] = [];
  for (const { id, orderId, order } of stale) {
    // only unpaid orders: a paid one moves on from DRAFT
    if (!order || order.state !== "DRAFT") continue;
    const meta = metaOf(order);
    const units = heldUnits(meta);
    if (!units.length) continue;
    const quantity = units.reduce((s, [, n]) => s + n, 0);

    if (isSoftHold(meta)) {
      // nothing left the stock — killing the link is the whole release
      try {
        await client.checkout.paymentLinks.delete({ id });
        released.push({ linkId: id, orderId, quantity });
      } catch (err) {
        console.error(`[holds] couldn't delete link ${id}:`, err);
      }
      continue;
    }

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
        changes: units.map(([variationId, n]) => ({
          type: "ADJUSTMENT",
          adjustment: {
            catalogObjectId: variationId,
            locationId,
            fromState: "NONE",
            toState: "IN_STOCK",
            quantity: String(n),
            occurredAt: now.toISOString(),
          },
        })),
      });
      released.push({ linkId: id, orderId, quantity });
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
