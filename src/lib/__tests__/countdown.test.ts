import { describe, it, expect } from "vitest";
import { getTimeLeft, pad, isGateOpen } from "@/lib/countdown";

describe("getTimeLeft", () => {
  it("returns done=true when target is in the past", () => {
    const result = getTimeLeft(Date.now() - 1000);
    expect(result.done).toBe(true);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it("returns done=true when target equals now", () => {
    const now = Date.now();
    expect(getTimeLeft(now, now).done).toBe(true);
  });

  it("returns correct hours/minutes/seconds for future target", () => {
    const now = 0;
    const target = (2 * 3600 + 15 * 60 + 30) * 1000; // 2h 15m 30s
    const result = getTimeLeft(target, now);
    expect(result.hours).toBe(2);
    expect(result.minutes).toBe(15);
    expect(result.seconds).toBe(30);
    expect(result.done).toBe(false);
  });

  it("does not return negative values", () => {
    const result = getTimeLeft(Date.now() - 99999);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
    expect(result.seconds).toBeGreaterThanOrEqual(0);
  });

  it("floors seconds correctly", () => {
    const now = 0;
    const target = 1500; // 1.5 seconds
    const result = getTimeLeft(target, now);
    expect(result.seconds).toBe(1);
  });
});

describe("pad", () => {
  it("pads single digit with leading zero", () => {
    expect(pad(0)).toBe("00");
    expect(pad(5)).toBe("05");
    expect(pad(9)).toBe("09");
  });

  it("does not pad two digit numbers", () => {
    expect(pad(10)).toBe("10");
    expect(pad(59)).toBe("59");
  });
});

describe("isGateOpen", () => {
  it("returns false before opensAt", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isGateOpen(future)).toBe(false);
  });

  it("returns true after opensAt", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isGateOpen(past)).toBe(true);
  });

  it("returns true exactly at opensAt", () => {
    const now = Date.now();
    expect(isGateOpen(new Date(now).toISOString(), now)).toBe(true);
  });
});
