import { describe, it, expect } from "vitest";
import { mapCatalogItemToPiece } from "@/lib/square";
import type { PieceState } from "@/types/piece";

const noImages = new Map<string, string>();
const noInventory = new Map<string, PieceState>();

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    type: "ITEM",
    id: "XYZABC123",
    customAttributeValues: {
      "Square:glaze-key": { name: "glaze", stringValue: "cobalt slip · clear" },
      "Square:dim-key": { name: "dim", stringValue: "11×9 cm" },
      "Square:num-key": { name: "piece_number", stringValue: "014" },
    },
    itemData: {
      name: "small cobalt mug",
      description: "a cobalt slip, dipped twice.",
      variations: [
        {
          id: "VAR001",
          itemVariationData: {
            priceMoney: { amount: BigInt(14800), currency: "USD" },
          },
        },
      ],
      imageIds: [],
      categories: [],
      ...overrides,
    },
  };
}

describe("mapCatalogItemToPiece", () => {
  it("maps a well-formed catalog item", () => {
    const piece = mapCatalogItemToPiece(makeItem(), noImages, noInventory);
    expect(piece).not.toBeNull();
    expect(piece!.id).toBe("XYZABC123");
    expect(piece!.title).toBe("small cobalt mug");
    expect(piece!.price).toBe(148);
    expect(piece!.glaze).toBe("cobalt slip · clear");
    expect(piece!.dim).toBe("11×9 cm");
    expect(piece!.n).toBe("014");
  });

  it("defaults to 'here' when not in inventory map", () => {
    const piece = mapCatalogItemToPiece(makeItem(), noImages, noInventory);
    expect(piece!.state).toBe("here");
  });

  it("uses 'here' when inventory count is 1", () => {
    const inv = new Map<string, PieceState>([["VAR001", "here"]]);
    const piece = mapCatalogItemToPiece(makeItem(), noImages, inv);
    expect(piece!.state).toBe("here");
  });

  it("uses 'gone' when inventory count is 0", () => {
    const inv = new Map<string, PieceState>([["VAR001", "gone"]]);
    const piece = mapCatalogItemToPiece(makeItem(), noImages, inv);
    expect(piece!.state).toBe("gone");
  });

  it("falls back to placeholder image when no imageIds", () => {
    const piece = mapCatalogItemToPiece(makeItem(), noImages, noInventory);
    expect(piece!.srcs).toEqual(["/assets/photo-placeholder.png"]);
  });

  it("uses catalog image URL when available", () => {
    const images = new Map([["img001", "https://cdn.example.com/mug.jpg"]]);
    const item = makeItem({ imageIds: ["img001"] });
    const piece = mapCatalogItemToPiece(item, images, noInventory);
    expect(piece!.srcs).toEqual(["https://cdn.example.com/mug.jpg"]);
  });

  it("collects multiple image URLs in order", () => {
    const images = new Map([
      ["img001", "https://cdn.example.com/mug-1.jpg"],
      ["img002", "https://cdn.example.com/mug-2.jpg"],
    ]);
    const item = makeItem({ imageIds: ["img001", "img002"] });
    const piece = mapCatalogItemToPiece(item, images, noInventory);
    expect(piece!.srcs).toHaveLength(2);
    expect(piece!.srcs[0]).toBe("https://cdn.example.com/mug-1.jpg");
  });

  it("maps categories to collections array", () => {
    const item = makeItem({
      categories: [{ id: "CAT1" }, { id: "CAT2" }],
    });
    const piece = mapCatalogItemToPiece(item, noImages, noInventory);
    expect(piece!.collections).toEqual(["CAT1", "CAT2"]);
  });

  it("returns null for non-ITEM types", () => {
    const image = { type: "IMAGE", id: "img001", imageData: { url: "x" } };
    expect(mapCatalogItemToPiece(image, noImages, noInventory)).toBeNull();
  });

  it("returns null for null input", () => {
    expect(mapCatalogItemToPiece(null, noImages, noInventory)).toBeNull();
  });

  it("returns null when itemData is missing", () => {
    expect(
      mapCatalogItemToPiece({ type: "ITEM", id: "x" }, noImages, noInventory),
    ).toBeNull();
  });

  it("handles missing price gracefully (price = 0)", () => {
    const item = makeItem({ variations: [] });
    const piece = mapCatalogItemToPiece(item, noImages, noInventory);
    expect(piece!.price).toBe(0);
  });

  it("uses last 3 chars of id as piece number when attribute missing", () => {
    const item = {
      ...makeItem(),
      customAttributeValues: {},
    };
    const piece = mapCatalogItemToPiece(item, noImages, noInventory);
    expect(piece!.n).toBe("123");
  });
});
