import { describe, expect, it } from "vitest";
import {
  canHaveDesign,
  designExtra,
  startingPrice,
  subtotal,
  unitPrice,
  usd,
} from "@/lib/commission-prices";
import { DESIGNABLE, PIECE_TYPES } from "@/lib/wholesale";

describe("commission prices", () => {
  it("prices every size from the price sheet", () => {
    const sheet = {
      cup: [2400, 2800, 3200],
      "mug-with-handle": [2800, 3200, 3600],
      tumbler: [3400, 4000, 4600],
    } as const;
    for (const [type, prices] of Object.entries(sheet)) {
      (["8", "10", "12"] as const).forEach((size, i) =>
        expect(unitPrice({ type: type as "cup", size })).toBe(prices[i]),
      );
    }
  });

  it("uses the sheet's own price for each piece with a design", () => {
    const sheet = {
      cup: [3000, 3400, 4000],
      "mug-with-handle": [3400, 3600, 4200],
      tumbler: [4000, 4400, 4800],
    } as const;
    for (const [type, prices] of Object.entries(sheet)) {
      (["8", "10", "12"] as const).forEach((size, i) =>
        expect(unitPrice({ type: type as "cup", size, design: true })).toBe(
          prices[i],
        ),
      );
    }
    expect(unitPrice({ type: "cortado-cup", design: true })).toBe(2400);
    expect(unitPrice({ type: "espresso-cup", design: true })).toBe(1900);
    expect(unitPrice({ type: "matcha-bowl", design: true })).toBe(5400);
    expect(unitPrice({ type: "trinket-dish", design: true })).toBe(1900);
    expect(designExtra("cup", "8")).toBe(600);
    expect(designExtra("tumbler", "12")).toBe(200);
    expect(designExtra("cup", "custom")).toBeNull();
  });

  it("prices one-size pieces", () => {
    expect(unitPrice({ type: "matcha-bowl" })).toBe(5000);
    expect(unitPrice({ type: "espresso-cup" })).toBe(1500);
    expect(unitPrice({ type: "cortado-cup" })).toBe(2000);
    expect(unitPrice({ type: "trinket-dish" })).toBe(1500);
  });

  it("offers a design on exactly the pieces that have a design price", () => {
    for (const type of PIECE_TYPES) {
      expect(canHaveDesign(type), type).toBe(DESIGNABLE.includes(type));
    }
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
    ).toEqual({ cents: 2400 * 2 + 4200, unpriced: 1 });
  });

  it("starts sized pieces at their smallest", () => {
    expect(startingPrice("cup")).toBe(2400);
    expect(startingPrice("tumbler")).toBe(3400);
    expect(startingPrice("matcha-bowl")).toBe(5000);
    expect(startingPrice("other")).toBeNull();
  });

  it("formats dollars the way a price tag would", () => {
    expect(usd(2400)).toBe("$24");
    expect(usd(750)).toBe("$7.50");
    expect(usd(0)).toBe("$0");
  });
});
