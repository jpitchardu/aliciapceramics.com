import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SquareClient } from "square";
import {
  buildLineItems,
  createSquareBulkOrder,
  findVariation,
  toE164,
  type WholesaleCatalog,
} from "@/lib/wholesale-square";
import type { BulkOrder } from "@/lib/wholesale";

const catalog: WholesaleCatalog = new Map([
  [
    "wholesale no handle mug",
    new Map([
      ["8 oz", "CUP8"],
      ["10 oz", "CUP10"],
      ["12 oz", "CUP12"],
    ]),
  ],
  ["wholesale matcha bowl", new Map([["regular", "MATCHA"]])],
]);

const order: BulkOrder = {
  submissionId: "5b0c9f8e-3c1a-4c7e-9a51-2f6f7d0b6e21",
  code: "buy-more-mugs",
  contact: {
    name: "june park",
    business: "still life coffee",
    email: "june@stilllife.coffee",
    phone: "(214) 555-0134",
  },
  lines: [
    { type: "cup", size: "10", quantity: 6, description: "speckled cream" },
    { type: "matcha-bowl", quantity: 2, description: "" },
    { type: "other", quantity: 4, description: "small bud vases" },
  ],
  inspiration: "pinterest.com/stilllife",
  notes: "for the new location",
  consent: true,
};

describe("findVariation", () => {
  it("matches sized pieces by size and one-size pieces by their only variation", () => {
    expect(findVariation({ type: "cup", size: "12" }, catalog)).toBe("CUP12");
    expect(findVariation({ type: "matcha-bowl" }, catalog)).toBe("MATCHA");
  });

  it("returns null when square has nothing to price it from", () => {
    expect(findVariation({ type: "other" }, catalog)).toBeNull();
    expect(findVariation({ type: "tumbler", size: "8" }, catalog)).toBeNull();
  });
});

describe("buildLineItems", () => {
  it("prices catalog pieces from square and leaves the rest at $0", () => {
    const items = buildLineItems(
      [
        ...order.lines,
        { type: "tumbler", size: "8", quantity: 1, description: "" },
      ],
      catalog,
    );
    expect(items[0]).toEqual({
      catalogObjectId: "CUP10",
      quantity: "6",
      note: "speckled cream",
    });
    expect(items[1]).toEqual({
      catalogObjectId: "MATCHA",
      quantity: "2",
      note: undefined,
    });
    expect(items[2]).toMatchObject({
      name: "something else",
      quantity: "4",
      basePriceMoney: { amount: BigInt(0) },
      note: "small bud vases",
    });
    // a priced piece square doesn't know about is flagged for alicia
    expect(items[3]).toMatchObject({
      name: "tumbler · 8 oz",
      basePriceMoney: { amount: BigInt(0) },
      note: "(no wholesale price found in square)",
    });
  });
});

describe("toE164", () => {
  it("formats us numbers and drops anything else", () => {
    expect(toE164("(214) 555-0134")).toBe("+12145550134");
    expect(toE164("1 214 555 0134")).toBe("+12145550134");
    expect(toE164("")).toBeUndefined();
    expect(toE164("+44 20 7946 0958")).toBeUndefined();
  });
});

function mockClient({ existingCustomer }: { existingCustomer?: string } = {}) {
  const client = {
    catalog: {
      search: vi.fn().mockResolvedValue({
        objects: [
          {
            type: "ITEM",
            itemData: {
              name: "Wholesale No Handle Mug",
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "CUP10",
                  itemVariationData: { name: "10 oz" },
                },
              ],
            },
          },
        ],
      }),
    },
    customers: {
      search: vi.fn().mockResolvedValue({
        customers: existingCustomer ? [{ id: existingCustomer }] : [],
      }),
      create: vi.fn().mockResolvedValue({ customer: { id: "NEWCUST" } }),
    },
    orders: { create: vi.fn().mockResolvedValue({ order: { id: "ORDER1" } }) },
    invoices: {
      create: vi.fn().mockResolvedValue({ invoice: { id: "INV1" } }),
    },
  };
  return client;
}

const code = {
  code: "buy-more-mugs",
  earliest: "2026-12-15",
};

describe("createSquareBulkOrder", () => {
  beforeEach(() => vi.stubEnv("SQUARE_LOCATION_ID", "LOC1"));
  afterEach(() => vi.unstubAllEnvs());

  it("creates the customer, the order and a draft invoice", async () => {
    const client = mockClient();
    const result = await createSquareBulkOrder(
      client as unknown as SquareClient,
      order,
      code,
      order.submissionId,
    );
    expect(result).toEqual({ orderId: "ORDER1", invoiceId: "INV1" });

    expect(client.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: "still life coffee",
        emailAddress: "june@stilllife.coffee",
        phoneNumber: "+12145550134",
      }),
    );

    const orderReq = client.orders.create.mock.calls[0][0];
    expect(orderReq.idempotencyKey).toBe(`ws-${order.submissionId}-order`);
    expect(orderReq.order).toMatchObject({
      locationId: "LOC1",
      customerId: "NEWCUST",
      referenceId: "buy-more-mugs",
    });
    expect(orderReq.order.lineItems).toHaveLength(3);

    const invoiceReq = client.invoices.create.mock.calls[0][0];
    expect(invoiceReq.idempotencyKey).toBe(`ws-${order.submissionId}-invoice`);
    expect(invoiceReq.invoice).toMatchObject({
      orderId: "ORDER1",
      primaryRecipient: { customerId: "NEWCUST" },
      paymentRequests: [{ requestType: "BALANCE", dueDate: "2026-12-15" }],
    });
    // never scheduled or published from here — it stays a draft
    expect(invoiceReq.invoice.scheduledAt).toBeUndefined();
    expect(invoiceReq.invoice.description).toContain("for the new location");
  });

  it("reuses a customer square already has for that email", async () => {
    const client = mockClient({ existingCustomer: "OLDCUST" });
    await createSquareBulkOrder(
      client as unknown as SquareClient,
      order,
      code,
      order.submissionId,
    );
    expect(client.customers.create).not.toHaveBeenCalled();
    expect(client.orders.create.mock.calls[0][0].order.customerId).toBe(
      "OLDCUST",
    );
  });
});
