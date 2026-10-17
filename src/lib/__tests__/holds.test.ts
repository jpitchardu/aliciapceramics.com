import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SquareClient } from "square";
import { releaseStaleHolds, resetHoldThrottle } from "@/lib/holds";

const now = new Date("2026-11-01T12:00:00Z");
const ago = (min: number) =>
  new Date(now.getTime() - min * 60000).toISOString();

function mockClient(
  links: { id: string; orderId: string; createdAt: string }[],
  orders: Record<string, unknown>[],
) {
  return {
    checkout: {
      paymentLinks: {
        list: vi.fn(async () => links),
        delete: vi.fn(async () => ({})),
      },
    },
    orders: {
      batchGet: vi.fn(async () => ({ orders })),
      update: vi.fn(async () => ({})),
    },
    inventory: { batchCreateChanges: vi.fn(async (_req: unknown) => ({})) },
  };
}

const unpaid = (
  id: string,
  meta = { variationIds: "SEAT", variationQuantities: "2" },
) => ({
  id,
  state: "DRAFT",
  version: 1,
  metadata: meta,
});

describe("releaseStaleHolds", () => {
  beforeEach(() => {
    vi.stubEnv("SQUARE_LOCATION_ID", "LOC");
    resetHoldThrottle();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("gives back seats from unpaid checkouts older than 30 minutes", async () => {
    const client = mockClient(
      [
        { id: "OLD", orderId: "O1", createdAt: ago(45) },
        { id: "FRESH", orderId: "O2", createdAt: ago(10) },
      ],
      [unpaid("O1")],
    );
    const released = await releaseStaleHolds(
      client as unknown as SquareClient,
      { now },
    );
    expect(released).toEqual([{ linkId: "OLD", orderId: "O1", quantity: 2 }]);
    // the webhook can't restore it a second time…
    expect(client.orders.update).toHaveBeenCalledWith({
      orderId: "O1",
      order: { locationId: "LOC", version: 1 },
      fieldsToClear: ["metadata"],
    });
    // …the link stops working…
    expect(client.checkout.paymentLinks.delete).toHaveBeenCalledWith({
      id: "OLD",
    });
    // …and the two seats go back in stock
    const change = client.inventory.batchCreateChanges.mock.calls[0][0] as any;
    expect(change.changes[0].adjustment).toMatchObject({
      catalogObjectId: "SEAT",
      fromState: "NONE",
      toState: "IN_STOCK",
      quantity: "2",
    });
  });

  it("leaves paid orders, old shop links and links without holds alone", async () => {
    const client = mockClient(
      [
        { id: "PAID", orderId: "O1", createdAt: ago(60) },
        { id: "LEGACY", orderId: "O2", createdAt: "2026-08-08T06:42:05Z" },
        { id: "NOHOLD", orderId: "O3", createdAt: ago(60) },
      ],
      [
        { ...unpaid("O1"), state: "OPEN" },
        unpaid("O2"),
        unpaid("O3", {} as never),
      ],
    );
    const released = await releaseStaleHolds(
      client as unknown as SquareClient,
      { now },
    );
    expect(released).toEqual([]);
    expect(client.checkout.paymentLinks.delete).not.toHaveBeenCalled();
    expect(client.inventory.batchCreateChanges).not.toHaveBeenCalled();
  });

  it("doesn't touch stock if it can't stop the webhook doubling up", async () => {
    const client = mockClient(
      [{ id: "OLD", orderId: "O1", createdAt: ago(45) }],
      [unpaid("O1")],
    );
    client.orders.update.mockRejectedValueOnce(new Error("nope"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(
      await releaseStaleHolds(client as unknown as SquareClient, { now }),
    ).toEqual([]);
    expect(client.inventory.batchCreateChanges).not.toHaveBeenCalled();
  });

  it("sweeps at most every few minutes unless forced", async () => {
    const client = mockClient([], []);
    await releaseStaleHolds(client as unknown as SquareClient, { now });
    await releaseStaleHolds(client as unknown as SquareClient, { now });
    expect(client.checkout.paymentLinks.list).toHaveBeenCalledTimes(1);
    await releaseStaleHolds(client as unknown as SquareClient, {
      now,
      force: true,
    });
    expect(client.checkout.paymentLinks.list).toHaveBeenCalledTimes(2);
  });
});
