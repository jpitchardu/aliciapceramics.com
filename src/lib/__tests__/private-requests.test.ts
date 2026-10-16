import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SquareClient } from "square";
import {
  createSquarePrivateRequest,
  privateRequestSchema,
  requestLineItems,
  requestNote,
  type PrivateRequest,
} from "@/lib/private-requests";

const base: PrivateRequest = {
  submissionId: "5b0c9f8e-3c1a-4c7e-9a51-2f6f7d0b6e21",
  place: "studio",
  address: "",
  format: "handbuilding",
  dates: [{ date: "2026-11-05", label: "thu nov 5 · evening" }],
  guests: 8,
  occasion: "my sister's birthday",
  name: "marisol reyes",
  email: "marisol@example.com",
  phone: "",
  notes: "two of us have thrown before.",
};
const ok = (r: object) =>
  privateRequestSchema.safeParse({ ...base, ...r }).success;

describe("private requests", () => {
  it("holds the studio to ten, and asks where when it travels", () => {
    expect(ok({})).toBe(true);
    expect(ok({ guests: 11 })).toBe(false);
    expect(ok({ place: "yours", guests: 14 })).toBe(false);
    expect(
      ok({
        place: "yours",
        guests: 14,
        address: "oak cliff",
        format: "painting",
      }),
    ).toBe(true);
  });

  it("matches the format to the place and needs a date", () => {
    expect(ok({ place: "yours", address: "x", format: "painting" })).toBe(true);
    expect(ok({ place: "yours", address: "x", format: "handbuilding" })).toBe(
      false,
    );
    expect(ok({ format: "painting" })).toBe(false);
    expect(ok({ dates: [] })).toBe(false);
  });

  it("puts what alicia needs in the order note, under 500", () => {
    expect(requestNote({ ...base, phone: "214 555 0134" })).toBe(
      "dates: thu nov 5 · evening\noccasion: my sister's birthday\nphone: 214 555 0134\ntheir note: two of us have thrown before.",
    );
    const long = requestNote({
      ...base,
      place: "yours",
      address: "a".repeat(120),
      occasion: "c".repeat(80),
      notes: "d".repeat(250),
    });
    expect(long.length).toBeLessThanOrEqual(500);
  });

  it("prices it from $55 a head, with travel left for alicia", () => {
    expect(requestLineItems(base)).toEqual([
      expect.objectContaining({
        name: "private event · handbuilding · here at the studio",
        quantity: "8",
        basePriceMoney: { amount: BigInt(5500), currency: "USD" },
      }),
    ]);
    const away = requestLineItems({ ...base, place: "yours", address: "x" });
    expect(away[1]).toMatchObject({
      name: "travel",
      basePriceMoney: { amount: BigInt(0) },
    });
  });
});

describe("createSquarePrivateRequest", () => {
  beforeEach(() => vi.stubEnv("SQUARE_LOCATION_ID", "LOC"));
  afterEach(() => vi.unstubAllEnvs());

  it("makes the person, an order with the note, and a draft invoice", async () => {
    const client = {
      customers: {
        search: vi.fn(async () => ({ customers: [] })),
        create: vi.fn(async () => ({ customer: { id: "CUST" } })),
      },
      orders: {
        create: vi.fn(async (_r: unknown) => ({ order: { id: "ORD" } })),
      },
      invoices: {
        create: vi.fn(async (_r: unknown) => ({ invoice: { id: "INV" } })),
      },
    };
    const ids = await createSquarePrivateRequest(
      client as unknown as SquareClient,
      base,
      new Date("2026-10-15T12:00:00Z"),
    );
    expect(ids).toEqual({ orderId: "ORD", invoiceId: "INV" });
    const order = (client.orders.create.mock.calls[0][0] as any).order;
    expect(order.customerId).toBe("CUST");
    expect(order.fulfillments[0].pickupDetails).toMatchObject({
      pickupAt: "2026-11-05T18:00:00Z",
      note: expect.stringContaining("thu nov 5 · evening"),
    });
    const invoice = (client.invoices.create.mock.calls[0][0] as any).invoice;
    expect(invoice).toMatchObject({
      orderId: "ORD",
      title: "private event",
      paymentRequests: [{ requestType: "BALANCE", dueDate: "2026-11-05" }],
    });
    // it stays a draft — never scheduled or sent from here
    expect(invoice.scheduledAt).toBeUndefined();
    expect(invoice.description).not.toContain("birthday");
  });
});
