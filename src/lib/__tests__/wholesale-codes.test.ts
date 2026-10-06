import { describe, expect, it } from "vitest";
import { estimatedCompletion, findBulkCode } from "@/lib/wholesale-codes";

const now = new Date("2026-10-06T15:00:00Z");

describe("findBulkCode", () => {
  it("accepts the code in any case and dates it twelve weeks out", () => {
    expect(findBulkCode(" BUY-More-Mugs ", now)).toEqual({
      code: "buy-more-mugs",
      earliest: "2026-12-29",
    });
  });

  it("turns away anything else", () => {
    expect(findBulkCode("bloom-24", now)).toBeNull();
    expect(findBulkCode("", now)).toBeNull();
  });
});

describe("estimatedCompletion", () => {
  it("is a calendar day twelve weeks on", () => {
    expect(estimatedCompletion(new Date("2026-01-01T12:00:00Z"))).toBe(
      "2026-03-26",
    );
  });
});
