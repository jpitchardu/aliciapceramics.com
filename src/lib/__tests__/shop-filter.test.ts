import { describe, it, expect } from "vitest";
import { isShopItem, type ShopFilter } from "@/lib/square";

const ONLINE = "CAT_ONLINE_SHOP";
const MARKET_ONLY = "CAT_MARKET_ONLY";
const EVENTS = "CAT_EVENTS";

const filter: ShopFilter = {
  listedCategoryIds: new Set([ONLINE]),
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
      categories: [{ id: "CAT_MUGS" }, { id: ONLINE }],
      ...itemData,
    },
  };
}

describe("isShopItem", () => {
  it("keeps a regular item in the online shop category", () => {
    expect(isShopItem(makeItem(), filter)).toBe(true);
  });

  it("drops an item that isn't in the online shop category", () => {
    const item = makeItem({ categories: [{ id: "CAT_MUGS" }] });
    expect(isShopItem(item, filter)).toBe(false);
  });

  it("drops an item with no categories", () => {
    expect(isShopItem(makeItem({ categories: undefined }), filter)).toBe(false);
  });

  it("drops a market only item", () => {
    const item = makeItem({ categories: [{ id: MARKET_ONLY }] });
    expect(isShopItem(item, filter)).toBe(false);
  });

  it("lets market only win when an item is in both", () => {
    const item = makeItem({
      categories: [{ id: ONLINE }, { id: MARKET_ONLY }],
    });
    expect(isShopItem(item, filter)).toBe(false);
  });

  it("drops an item in the events category even if tagged online", () => {
    const item = makeItem({ categories: [{ id: ONLINE }, { id: EVENTS }] });
    expect(isShopItem(item, filter)).toBe(false);
  });

  it("drops non-REGULAR product types even if tagged online", () => {
    for (const productType of ["EVENT", "APPOINTMENTS_SERVICE", "GIFT_CARD"]) {
      expect(isShopItem(makeItem({ productType }), filter)).toBe(false);
    }
  });

  it("treats a missing product type as regular", () => {
    expect(isShopItem(makeItem({ productType: undefined }), filter)).toBe(true);
  });

  it("drops everything when the online shop category doesn't exist yet", () => {
    const none: ShopFilter = {
      listedCategoryIds: new Set(),
      excludedCategoryIds: new Set(),
    };
    expect(isShopItem(makeItem(), none)).toBe(false);
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
