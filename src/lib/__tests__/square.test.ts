import { describe, it, expect } from "vitest";
import { mapCatalogItemToPiece } from "@/lib/square";

const noImages = new Map<string, string>();

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    type: "ITEM",
    id: "XYZABC123",
    itemData: {
      name: "small cobalt mug",
      description: "a cobalt slip, dipped twice.",
      variations: [
        {
          itemVariationData: {
            priceMoney: { amount: BigInt(14800), currency: "USD" },
          },
        },
      ],
      customAttributeValues: {
        "Square:glaze-key": {
          name: "glaze",
          stringValue: "cobalt slip · clear",
        },
        "Square:dim-key": { name: "dim", stringValue: "11×9 cm" },
        "Square:num-key": { name: "piece_number", stringValue: "014" },
        "Square:state-key": { name: "state", stringValue: "" },
      },
      imageIds: [],
      categories: [],
      ...overrides,
    },
  };
}

describe("mapCatalogItemToPiece", () => {
  it("maps a well-formed catalog item", () => {
    const piece = mapCatalogItemToPiece(makeItem(), noImages);
    expect(piece).not.toBeNull();
    expect(piece!.id).toBe("XYZABC123");
    expect(piece!.title).toBe("small cobalt mug");
    expect(piece!.price).toBe(148);
    expect(piece!.glaze).toBe("cobalt slip · clear");
    expect(piece!.dim).toBe("11×9 cm");
    expect(piece!.n).toBe("014");
    expect(piece!.state).toBe("here");
  });

  it("falls back to placeholder image when no imageIds", () => {
    const piece = mapCatalogItemToPiece(makeItem(), noImages);
    expect(piece!.srcs).toEqual(["/assets/photo-placeholder.png"]);
  });

  it("uses catalog image URL when available", () => {
    const images = new Map([["img001", "https://cdn.example.com/mug.jpg"]]);
    const item = makeItem({ imageIds: ["img001"] });
    const piece = mapCatalogItemToPiece(item, images);
    expect(piece!.srcs).toEqual(["https://cdn.example.com/mug.jpg"]);
  });

  it("collects multiple image URLs in order", () => {
    const images = new Map([
      ["img001", "https://cdn.example.com/mug-1.jpg"],
      ["img002", "https://cdn.example.com/mug-2.jpg"],
    ]);
    const item = makeItem({ imageIds: ["img001", "img002"] });
    const piece = mapCatalogItemToPiece(item, images);
    expect(piece!.srcs).toHaveLength(2);
    expect(piece!.srcs[0]).toBe("https://cdn.example.com/mug-1.jpg");
  });

  it("maps categories to collections array", () => {
    const item = makeItem({
      categories: [{ id: "CAT1" }, { id: "CAT2" }],
    });
    const piece = mapCatalogItemToPiece(item, noImages);
    expect(piece!.collections).toEqual(["CAT1", "CAT2"]);
  });

  it("returns null for non-ITEM types", () => {
    const image = { type: "IMAGE", id: "img001", imageData: { url: "x" } };
    expect(mapCatalogItemToPiece(image, noImages)).toBeNull();
  });

  it("returns null for null input", () => {
    expect(mapCatalogItemToPiece(null, noImages)).toBeNull();
  });

  it("returns null when itemData is missing", () => {
    expect(
      mapCatalogItemToPiece({ type: "ITEM", id: "x" }, noImages),
    ).toBeNull();
  });

  it("treats 'held' attribute as 'here' (first come first serve)", () => {
    const item = makeItem({
      customAttributeValues: {
        "Square:state-key": { name: "state", stringValue: "held" },
      },
    });
    const piece = mapCatalogItemToPiece(item, noImages);
    expect(piece!.state).toBe("here");
  });

  it("infers state 'gone' from custom attribute", () => {
    const item = makeItem({
      customAttributeValues: {
        "Square:state-key": { name: "state", stringValue: "taken" },
      },
    });
    const piece = mapCatalogItemToPiece(item, noImages);
    expect(piece!.state).toBe("gone");
  });

  it("defaults to 'here' when state attribute is empty", () => {
    const piece = mapCatalogItemToPiece(makeItem(), noImages);
    expect(piece!.state).toBe("here");
  });

  it("handles missing price gracefully (price = 0)", () => {
    const item = makeItem({ variations: [] });
    const piece = mapCatalogItemToPiece(item, noImages);
    expect(piece!.price).toBe(0);
  });

  it("uses last 3 chars of id as piece number when attribute missing", () => {
    const item = makeItem({
      customAttributeValues: {},
    });
    const piece = mapCatalogItemToPiece(item, noImages);
    expect(piece!.n).toBe("123"); // last 3 of "XYZABC123"
  });
});
