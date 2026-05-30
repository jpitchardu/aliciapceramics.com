import { describe, it, expect } from "vitest";
import {
  FIXTURE_PIECES,
  FIXTURE_CATEGORIES,
} from "@/lib/__fixtures__/catalog";

describe("FIXTURE_PIECES", () => {
  it("has at least one piece", () => {
    expect(FIXTURE_PIECES.length).toBeGreaterThan(0);
  });

  it("every piece has a non-empty srcs array", () => {
    for (const p of FIXTURE_PIECES) {
      expect(p.srcs.length).toBeGreaterThan(0);
    }
  });

  it("every piece has a valid state", () => {
    for (const p of FIXTURE_PIECES) {
      expect(["here", "gone"]).toContain(p.state);
    }
  });

  it("every piece has a non-empty id", () => {
    for (const p of FIXTURE_PIECES) {
      expect(p.id.length).toBeGreaterThan(0);
    }
  });

  it("piece ids are unique", () => {
    const ids = FIXTURE_PIECES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("real item from Square API is present with correct fields", () => {
    const look = FIXTURE_PIECES.find(
      (p) => p.id === "MDCV2BMWYMDYJO6DMQKNS2HA",
    );
    expect(look).toBeDefined();
    expect(look!.title).toBe('"Look" 12oz Cup');
    expect(look!.price).toBe(40);
    expect(look!.glaze).toContain("pink");
    expect(look!.srcs.length).toBe(3);
    expect(look!.collections).toContain("7MBVR3HSSRBSXYNC5GS6WCJ3");
  });

  it("multi-category piece belongs to both categories", () => {
    const look = FIXTURE_PIECES.find(
      (p) => p.id === "MDCV2BMWYMDYJO6DMQKNS2HA",
    )!;
    expect(look.collections).toContain("7MBVR3HSSRBSXYNC5GS6WCJ3");
    expect(look.collections).toContain("DLWWZFQLXFYHZZKMICVWAYF6");
  });

  it("filtering by cups category returns only cups", () => {
    const cupsId = "7MBVR3HSSRBSXYNC5GS6WCJ3";
    const cups = FIXTURE_PIECES.filter((p) => p.collections.includes(cupsId));
    expect(cups.length).toBeGreaterThan(0);
    expect(cups.length).toBeLessThan(FIXTURE_PIECES.length);
  });

  it("filtering by bowls category returns only bowls", () => {
    const bowlsId = "DLWWZFQLXFYHZZKMICVWAYF6";
    const bowls = FIXTURE_PIECES.filter((p) =>
      p.collections.includes(bowlsId),
    );
    expect(bowls.length).toBeGreaterThan(0);
    expect(bowls.length).toBeLessThan(FIXTURE_PIECES.length);
  });

  it("at least one piece is gone", () => {
    expect(FIXTURE_PIECES.some((p) => p.state === "gone")).toBe(true);
  });
});

describe("FIXTURE_CATEGORIES", () => {
  it("has at least two categories", () => {
    expect(FIXTURE_CATEGORIES.length).toBeGreaterThanOrEqual(2);
  });

  it("category ids match the collections used in pieces", () => {
    const catIds = new Set(FIXTURE_CATEGORIES.map((c) => c.id));
    for (const p of FIXTURE_PIECES) {
      for (const col of p.collections) {
        expect(catIds.has(col)).toBe(true);
      }
    }
  });

  it("categories have non-empty names", () => {
    for (const c of FIXTURE_CATEGORIES) {
      expect(c.name.length).toBeGreaterThan(0);
    }
  });
});
