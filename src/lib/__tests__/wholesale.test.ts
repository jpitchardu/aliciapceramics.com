import { describe, expect, it } from "vitest";
import {
  bulkOrderSchema,
  numberWords,
  orderLineSchema,
  shortDate,
} from "@/lib/wholesale";

const contact = {
  name: "june park",
  business: "still life coffee",
  email: "june@stilllife.coffee",
  phone: "",
};

const order = (quantity: number) => ({
  code: "BLOOM-24",
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
    expect(ok({ type: "sippy-mug", size: "10" })).toBe(true);
    expect(ok({ type: "matcha-bowl", size: "8" })).toBe(false);
    expect(ok({ type: "matcha-bowl" })).toBe(true);
  });

  it("holds the ten-piece minimum", () => {
    expect(bulkOrderSchema.safeParse(order(9)).success).toBe(false);
    expect(bulkOrderSchema.safeParse(order(10)).success).toBe(true);
  });

  it("requires the terms to be accepted", () => {
    expect(
      bulkOrderSchema.safeParse({ ...order(12), consent: false }).success,
    ).toBe(false);
  });
});
