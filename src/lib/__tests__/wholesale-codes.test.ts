import { afterEach, describe, expect, it, vi } from "vitest";
import { estimatedCompletion, findBulkCode } from "@/lib/wholesale-codes";

const now = new Date("2026-10-06T15:00:00Z");

describe("findBulkCode", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts the shared code in any case and dates it twelve weeks out", () => {
    vi.stubEnv("WHOLESALE_CODE", "Kiln-2026");
    expect(findBulkCode(" kiln-2026 ", now)).toEqual({
      code: "Kiln-2026",
      earliest: "2026-12-29",
    });
    expect(findBulkCode("BLOOM-24", now)).toBeNull();
  });

  it("falls back to the demo code outside production", () => {
    vi.stubEnv("WHOLESALE_CODE", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(findBulkCode("bloom-24", now)?.code).toBe("BLOOM-24");
  });

  it("unlocks nothing in production until the code is set", () => {
    vi.stubEnv("WHOLESALE_CODE", "");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(findBulkCode("bloom-24", now)).toBeNull();
  });
});

describe("estimatedCompletion", () => {
  it("is a calendar day twelve weeks on", () => {
    expect(estimatedCompletion(new Date("2026-01-01T12:00:00Z"))).toBe(
      "2026-03-26",
    );
  });
});
