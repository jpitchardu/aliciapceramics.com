import { describe, expect, it } from "vitest";
import {
  bulkOrderSchema,
  numberWords,
  lineLabel,
  orderLineSchema,
  orderSchemaFor,
  shortDate,
} from "@/lib/wholesale";

const contact = {
  name: "june park",
  business: "still life coffee",
  email: "june@stilllife.coffee",
  phone: "",
};

const order = (quantity: number) => ({
  submissionId: "5b0c9f8e-3c1a-4c7e-9a51-2f6f7d0b6e21",
  code: "buy-more-mugs",
  contact,
  lines: [{ type: "cup", size: "12", quantity, description: "" }],
  inspiration: "",
  notes: "",
  consent: true,
});

describe("wholesale", () => {
  it("reads counts the way alicia would say them", () => {
    expect(numberWords(13)).toBe("thirteen");
    expect(numberWords(40)).toBe("forty");
    expect(numberWords(42)).toBe("forty-two");
    expect(numberWords(120)).toBe("120");
  });

  it("formats completion dates as calendar days", () => {
    expect(shortDate("2026-10-09")).toBe("oct 9");
    expect(shortDate("2027-01-01")).toBe("jan 1");
  });

  it("only takes sizes a piece actually comes in", () => {
    const base = { quantity: 2, description: "" };
    const ok = (l: object) =>
      orderLineSchema.safeParse({ ...base, ...l }).success;
    expect(ok({ type: "cup" })).toBe(false);
    expect(ok({ type: "cup", size: "espresso" })).toBe(false);
    expect(ok({ type: "cup", size: "8" })).toBe(true);
    expect(ok({ type: "mug-with-handle", size: "8" })).toBe(true);
    expect(ok({ type: "tumbler", size: "10" })).toBe(true);
    expect(ok({ type: "matcha-bowl", size: "8" })).toBe(false);
    expect(ok({ type: "matcha-bowl" })).toBe(true);
  });

  it("takes a custom size on sized pieces, as long as it's described", () => {
    const base = { quantity: 2, description: "" };
    const ok = (l: object) =>
      orderLineSchema.safeParse({ ...base, ...l }).success;
    expect(ok({ type: "cup", size: "custom", customSize: "16 oz" })).toBe(true);
    expect(ok({ type: "cup", size: "custom" })).toBe(false);
    expect(ok({ type: "cup", size: "custom", customSize: "  " })).toBe(false);
    expect(ok({ type: "matcha-bowl", size: "custom", customSize: "big" })).toBe(
      false,
    );
  });

  it("holds the ten-piece minimum", () => {
    expect(bulkOrderSchema.safeParse(order(9)).success).toBe(false);
    expect(bulkOrderSchema.safeParse(order(10)).success).toBe(true);
  });

  it("keeps a small commission to one to nine pieces", () => {
    const commission = orderSchemaFor("commission");
    const ok = (q: number) =>
      commission.safeParse({ ...order(q), code: "little-cute-mugs" }).success;
    expect(ok(1)).toBe(true);
    expect(ok(9)).toBe(true);
    expect(ok(10)).toBe(false);
  });

  it("doesn't ask a commission for a shop name, but a bulk order does", () => {
    const noShop = { ...order(3), contact: { ...contact, business: "" } };
    expect(orderSchemaFor("commission").safeParse(noShop).success).toBe(true);
    expect(
      bulkOrderSchema.safeParse({
        ...noShop,
        ...order(12),
        contact: noShop.contact,
      }).success,
    ).toBe(false);
  });

  it("only takes a design on cups, mugs and tumblers", () => {
    const base = { quantity: 2, description: "", design: true };
    const ok = (l: object) =>
      orderLineSchema.safeParse({ ...base, ...l }).success;
    expect(ok({ type: "cup", size: "8" })).toBe(true);
    expect(ok({ type: "matcha-bowl" })).toBe(false);
    expect(lineLabel({ type: "cup", size: "8", design: true })).toBe(
      "cup · 8 oz · with a design",
    );
  });

  it("takes espresso and cortado cups as one-size pieces", () => {
    const base = { quantity: 2, description: "" };
    const ok = (l: object) =>
      orderLineSchema.safeParse({ ...base, ...l }).success;
    expect(ok({ type: "espresso-cup" })).toBe(true);
    expect(ok({ type: "cortado-cup" })).toBe(true);
    expect(ok({ type: "cortado-cup", size: "8" })).toBe(false);
  });

  it("requires the terms to be accepted", () => {
    expect(
      bulkOrderSchema.safeParse({ ...order(12), consent: false }).success,
    ).toBe(false);
  });
});
