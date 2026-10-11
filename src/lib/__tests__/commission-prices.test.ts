import { describe, expect, it } from "vitest";
import {
  startingPrice,
  subtotal,
  unitPrice,
  usd,
} from "@/lib/commission-prices";

describe("commission prices", () => {
  it("prices sized pieces from the price sheet", () => {
    expect(unitPrice({ type: "cup", size: "8" })).toBe(2400);
    expect(unitPrice({ type: "mug-with-handle", size: "10" })).toBe(3200);
    expect(unitPrice({ type: "tumbler", size: "12" })).toBe(4600);
  });

  it("adds $4 for a design", () => {
    expect(unitPrice({ type: "cup", size: "12", design: true })).toBe(3600);
    expect(unitPrice({ type: "tumbler", size: "8", design: true })).toBe(4000);
  });

  it("prices one-size pieces", () => {
    expect(unitPrice({ type: "matcha-bowl" })).toBe(5000);
    expect(unitPrice({ type: "espresso-cup" })).toBe(1500);
    expect(unitPrice({ type: "cortado-cup" })).toBe(2400);
    expect(unitPrice({ type: "trinket-dish" })).toBe(1500);
  });

  it("leaves custom sizes and something else for alicia to price", () => {
    expect(unitPrice({ type: "cup", size: "custom" })).toBeNull();
    expect(unitPrice({ type: "other" })).toBeNull();
  });

  it("adds up what it can and counts the rest", () => {
    expect(
      subtotal([
        { type: "cup", size: "8", quantity: 2 },
        { type: "mug-with-handle", size: "12", design: true, quantity: 1 },
        { type: "cup", size: "custom", quantity: 3 },
      ]),
    ).toEqual({ cents: 2400 * 2 + 4000, unpriced: 1 });
  });

  it("starts sized pieces at their smallest", () => {
    expect(startingPrice("cup")).toBe(2400);
    expect(startingPrice("matcha-bowl")).toBe(5000);
    expect(startingPrice("other")).toBeNull();
  });

  it("formats dollars the way a price tag would", () => {
    expect(usd(2400)).toBe("$24");
    expect(usd(750)).toBe("$7.50");
    expect(usd(0)).toBe("$0");
  });
});
