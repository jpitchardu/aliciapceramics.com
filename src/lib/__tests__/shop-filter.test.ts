import { describe, it, expect } from "vitest";
import { isShopItem, type ShopFilter } from "@/lib/square";

const MARKET_ONLY = "CAT_MARKET_ONLY";
const EVENTS = "CAT_EVENTS";

const filter: ShopFilter = {
  excludedCategoryIds: new Set([MARKET_ONLY, EVENTS]),
};

function makeItem(itemData: Record<string, unknown> = {}, extra = {}) {
  return {
    type: "ITEM",
    id: "ITEM1",
    ...extra,
    itemData: {
      name: "cup",
      productType: "REGULAR",
      categories: [{ id: "CAT_MUGS" }],
      ...itemData,
    },
  };
}

describe("isShopItem", () => {
  it("keeps a regular item", () => {
    expect(isShopItem(makeItem(), filter)).toBe(true);
  });

  it("drops an item in the market only category", () => {
    const item = makeItem({
      categories: [{ id: "CAT_MUGS" }, { id: MARKET_ONLY }],
    });
    expect(isShopItem(item, filter)).toBe(false);
  });

  it("drops an item in the events category", () => {
    const item = makeItem({ categories: [{ id: EVENTS }] });
    expect(isShopItem(item, filter)).toBe(false);
  });

  it("drops non-REGULAR product types", () => {
    for (const productType of ["EVENT", "APPOINTMENTS_SERVICE", "GIFT_CARD"]) {
      expect(isShopItem(makeItem({ productType }), filter)).toBe(false);
    }
  });

  it("treats a missing product type as regular", () => {
    expect(isShopItem(makeItem({ productType: undefined }), filter)).toBe(true);
  });

  it("keeps an item with no categories", () => {
    expect(isShopItem(makeItem({ categories: undefined }), filter)).toBe(true);
  });

  it("drops archived and deleted items", () => {
    expect(isShopItem(makeItem({ isArchived: true }), filter)).toBe(false);
    expect(isShopItem(makeItem({}, { isDeleted: true }), filter)).toBe(false);
  });

  it("drops non-item objects", () => {
    expect(isShopItem({ type: "CATEGORY", id: "X" }, filter)).toBe(false);
    expect(isShopItem(null, filter)).toBe(false);
  });
});
