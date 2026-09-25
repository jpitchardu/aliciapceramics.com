import { describe, it, expect } from "vitest";
import { isShopItem, type ShopFilter } from "@/lib/square";

const ONLINE = "CH_ONLINE";
const POS = "CH_POS";
const EVENTS = "CAT_EVENTS";

const filter: ShopFilter = {
  onlineChannelId: ONLINE,
  eventCategoryIds: new Set([EVENTS]),
};

function makeItem(itemData: Record<string, unknown> = {}, extra = {}) {
  return {
    type: "ITEM",
    id: "ITEM1",
    ...extra,
    itemData: {
      name: "cup",
      productType: "REGULAR",
      channels: [POS, ONLINE],
      categories: [{ id: "CAT_MUGS" }],
      ...itemData,
    },
  };
}

describe("isShopItem", () => {
  it("keeps a regular item on the online channel", () => {
    expect(isShopItem(makeItem(), filter)).toBe(true);
  });

  it("drops a market-only item (online channel unticked)", () => {
    expect(isShopItem(makeItem({ channels: [POS] }), filter)).toBe(false);
  });

  it("drops an item in the events category even when online", () => {
    const item = makeItem({ categories: [{ id: "CAT_MUGS" }, { id: EVENTS }] });
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

  it("drops archived and deleted items", () => {
    expect(isShopItem(makeItem({ isArchived: true }), filter)).toBe(false);
    expect(isShopItem(makeItem({}, { isDeleted: true }), filter)).toBe(false);
  });

  it("skips the channel check when no online channel is configured", () => {
    const noChannel: ShopFilter = { eventCategoryIds: new Set([EVENTS]) };
    expect(isShopItem(makeItem({ channels: [POS] }), noChannel)).toBe(true);
    const event = makeItem({ categories: [{ id: EVENTS }] });
    expect(isShopItem(event, noChannel)).toBe(false);
  });

  it("drops non-item objects", () => {
    expect(isShopItem({ type: "CATEGORY", id: "X" }, filter)).toBe(false);
    expect(isShopItem(null, filter)).toBe(false);
  });
});
