import { describe, expect, it } from "vitest";
import { SAMPLE_EVENTS, money } from "@/lib/classes";
import {
  MENU_333,
  collabDetails,
  drinkExtra,
  drinkLabel,
  drinkUpgrades,
  encodeDrinks,
  menuFor,
  parseDrinks,
  type DrinkPick,
} from "@/lib/drinks";

const m = MENU_333;
const honey: DrinkPick = {
  drink: "honey-im-home",
  temp: "iced",
  milk: "oat",
  syrup: null,
};
const plain: DrinkPick = {
  drink: "matcha-latte",
  temp: "hot",
  milk: "pistachio",
  syrup: "earl-grey",
};

describe("the 333 matcha menu", () => {
  it("goes with a class that's a collab with 333 matcha, however it's written", () => {
    const matcha = SAMPLE_EVENTS.find((e) => e.id === "matcha-and-clay")!;
    expect(menuFor(matcha)).toBe(MENU_333);
    expect(
      menuFor({ ...matcha, collab: { ...matcha.collab!, with: "333 Matcha" } }),
    ).toBe(MENU_333);
    // the flower collab has no drinks
    expect(
      menuFor(SAMPLE_EVENTS.find((e) => e.id === "vessel-and-stem")!),
    ).toBeNull();
    expect(menuFor(SAMPLE_EVENTS[0])).toBeNull();
  });

  it("fills in the collab card", () => {
    expect(collabDetails("333 matcha").brings).toMatch(/matcha drink/);
    expect(collabDetails("poppy & fern")).toEqual({});
  });
});

describe("a seat's drink", () => {
  it("is included, with milk and syrup upgrades on top", () => {
    expect(drinkExtra(m, { ...honey, milk: "cow" })).toBe(0);
    expect(drinkExtra(m, honey)).toBe(0.5);
    expect(drinkExtra(m, plain)).toBe(1.25);
  });

  it("only takes a syrup on the plain matcha", () => {
    // a flavored matcha ignores a stray syrup rather than charging for it
    expect(drinkExtra(m, { ...honey, syrup: "chai" })).toBe(0.5);
    expect(drinkUpgrades(m, { ...honey, syrup: "chai" })).toHaveLength(1);
  });

  it("reads back plainly", () => {
    expect(drinkLabel(m, honey)).toBe("iced honey, i'm home matcha · oat milk");
    expect(drinkLabel(m, plain)).toBe(
      "hot matcha latte · pistachio milk · earl grey syrup",
    );
  });

  it("names its upgrades for square, with prices", () => {
    expect(drinkUpgrades(m, plain)).toEqual([
      { id: "pistachio", name: "pistachio milk", extra: 0.75 },
      { id: "earl-grey", name: "earl grey syrup", extra: 0.5 },
    ]);
  });
});

describe("drinks in a link", () => {
  it("round-trip, one per seat", () => {
    const raw = encodeDrinks([honey, plain]);
    expect(raw).toBe(
      "honey-im-home.iced.oat.,matcha-latte.hot.pistachio.earl-grey",
    );
    expect(parseDrinks(m, raw, 2)).toEqual([honey, plain]);
  });

  it("refuse anything off the menu or the wrong count", () => {
    expect(parseDrinks(m, undefined, 1)).toBeNull();
    expect(parseDrinks(m, encodeDrinks([honey]), 2)).toBeNull();
    expect(parseDrinks(m, "frappuccino.iced.oat.", 1)).toBeNull();
    expect(parseDrinks(m, "chai.warm.oat.", 1)).toBeNull();
    expect(parseDrinks(m, "chai.iced.goat.", 1)).toBeNull();
    // a syrup on a flavored matcha, or one that isn't on the menu
    expect(parseDrinks(m, "chai.iced.oat.chai", 1)).toBeNull();
    expect(parseDrinks(m, "matcha-latte.iced.oat.bubblegum", 1)).toBeNull();
  });
});

describe("money", () => {
  it("shows cents only when there are some", () => {
    expect(money(55)).toBe("$55");
    expect(money(55.5)).toBe("$55.50");
    expect(money(0.75)).toBe("$0.75");
  });
});
