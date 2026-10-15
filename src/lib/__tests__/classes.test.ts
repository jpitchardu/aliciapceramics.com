import { describe, expect, it } from "vitest";
import {
  SAMPLE_EVENTS,
  defaultPiece,
  fromPrice,
  hasUpgrades,
  parsePicks,
  total,
  type ClassEvent,
} from "@/lib/classes";
import { mapClass, parseDay, todayInDallas } from "@/lib/classes-square";

const wheel = SAMPLE_EVENTS.find((e) => e.id === "an-evening-at-the-wheel")!;
const glaze = SAMPLE_EVENTS.find((e) => e.id === "glaze-night")!;

describe("class pricing", () => {
  it("adds each seat's piece upgrade to the base ticket", () => {
    expect(total(wheel, ["sample-cup", "sample-mug", "sample-vase"])).toBe(
      95 + 103 + 110,
    );
    expect(total(glaze, [null, null])).toBe(80);
  });

  it("starts from the included piece", () => {
    expect(defaultPiece(wheel)).toBe("sample-cup");
    expect(fromPrice(wheel)).toBe(95);
    expect(hasUpgrades(wheel)).toBe(true);
    expect(defaultPiece(glaze)).toBeNull();
    expect(hasUpgrades(glaze)).toBe(false);
  });

  it("only takes pieces this class offers, one per seat, up to what's left", () => {
    expect(parsePicks(wheel, ["sample-mug", "sample-cup"])).toEqual([
      "sample-mug",
      "sample-cup",
    ]);
    expect(parsePicks(wheel, ["sample-mug", ""])).toBeNull();
    expect(parsePicks(wheel, ["sample-bud-vase"])).toBeNull();
    expect(
      parsePicks(wheel, Array(wheel.left + 1).fill("sample-cup")),
    ).toBeNull();
    expect(parsePicks(glaze, [null, null])).toEqual([null, null]);
    expect(parsePicks(glaze, ["sample-cup"])).toBeNull();
    expect(parsePicks(glaze, [])).toBeNull();
  });
});

describe("reading classes from square", () => {
  it("reads the dates alicia is likely to type", () => {
    expect(parseDay("2026-11-19")).toBe("2026-11-19");
    expect(parseDay("11/19/2026")).toBe("2026-11-19");
    expect(parseDay("11/19/26")).toBe("2026-11-19");
    expect(parseDay("Nov 19 2026")).toBe("2026-11-19");
    expect(parseDay("november 19, 2026")).toBe("2026-11-19");
    expect(parseDay("2026-02-30")).toBeNull();
    expect(parseDay("soon")).toBeNull();
    expect(parseDay("")).toBeNull();
  });

  it("knows what day it is in dallas", () => {
    // 3am UTC is still the evening before in dallas
    expect(todayInDallas(new Date("2026-11-20T03:00:00Z"))).toBe("2026-11-19");
  });

  const attr = (name: string, value: string) => ({
    [`Square:${name}`]: { name, stringValue: value },
  });
  const item = (attrs: Record<string, unknown>, extra = {}) => ({
    type: "ITEM",
    id: "CLASS1",
    itemData: {
      name: "An evening at the wheel",
      descriptionPlaintext: "we start with a wedged ball of clay.",
      imageIds: ["IMG1"],
      modifierListInfo: [{ modifierListId: "PIECES", enabled: true }],
      variations: [
        {
          id: "SEAT",
          itemVariationData: { priceMoney: { amount: BigInt(9500) } },
        },
      ],
      ...extra,
    },
    customAttributeValues: attrs,
  });
  const related = new Map<string, any>([
    [
      "IMG1",
      { id: "IMG1", type: "IMAGE", imageData: { url: "https://x/img.jpg" } },
    ],
    [
      "PIECES",
      {
        id: "PIECES",
        type: "MODIFIER_LIST",
        modifierListData: {
          modifiers: [
            {
              id: "CUP",
              modifierData: {
                name: "a cup",
                priceMoney: { amount: BigInt(0) },
              },
            },
            {
              id: "MUG",
              modifierData: {
                name: "a mug",
                priceMoney: { amount: BigInt(800) },
              },
            },
          ],
        },
      },
    ],
  ]);
  const counts = new Map([["SEAT", 4]]);

  it("maps a dated item to a class with its pieces, seats and price", () => {
    const e = mapClass(
      item({
        ...attr("class date", "11/19/2026"),
        ...attr("class time", "6:30 – 9 pm"),
        ...attr("total seats", "6"),
        ...attr("collab with", "poppy & fern"),
        ...attr("collab instagram", "@poppyandfern"),
      }),
      related,
      counts,
      "2026-10-15",
    ) as ClassEvent;
    expect(e).toMatchObject({
      id: "CLASS1",
      variationId: "SEAT",
      title: "An evening at the wheel",
      price: 95,
      seats: 6,
      left: 4,
      photo: "https://x/img.jpg",
      sessions: [{ date: "2026-11-19", time: "6:30 – 9 pm" }],
      pieces: [
        { id: "CUP", name: "a cup", extra: 0 },
        { id: "MUG", name: "a mug", extra: 8 },
      ],
      collab: { with: "poppy & fern", handle: "poppyandfern" },
    });
  });

  it("carries a second session", () => {
    const e = mapClass(
      item({
        ...attr("class date", "2026-12-03"),
        ...attr("class time", "6:30 – 9 pm"),
        ...attr("second date", "2026-12-10"),
      }),
      related,
      counts,
      "2026-10-15",
    )!;
    expect(e.sessions.map((s) => s.date)).toEqual(["2026-12-03", "2026-12-10"]);
    expect(e.sessions[1].time).toBe("6:30 – 9 pm");
  });

  it("leaves out undated, past and archived items", () => {
    expect(mapClass(item({}), related, counts, "2026-10-15")).toBeNull();
    expect(
      mapClass(
        item(attr("class date", "2026-10-01")),
        related,
        counts,
        "2026-10-15",
      ),
    ).toBeNull();
    expect(
      mapClass(
        item(attr("class date", "2026-11-19"), { isArchived: true }),
        related,
        counts,
        "2026-10-15",
      ),
    ).toBeNull();
  });

  it("is a set-piece class when no modifier list is switched on", () => {
    const e = mapClass(
      item(attr("class date", "2026-11-19"), { modifierListInfo: [] }),
      related,
      new Map(),
      "2026-10-15",
    )!;
    expect(e.pieces).toEqual([]);
    expect(e.left).toBe(0);
  });
});
