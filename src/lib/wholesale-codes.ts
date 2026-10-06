import type { BulkCode } from "@/lib/wholesale";

/*
 * The one bulk code alicia shares with the shops she's talked to. It matches
 * case-insensitively.
 *
 * The estimated completion date is the lead time from the day of the order:
 * about a week to talk and design, about ten to throw and fire.
 */

export const BULK_CODE = "buy-more-mugs";
export const LEAD_WEEKS = 12;

export const isProduction = () => process.env.VERCEL_ENV === "production";

/* the calendar day LEAD_WEEKS after `now`, as YYYY-MM-DD */
export function estimatedCompletion(now: Date): string {
  const d = new Date(now.getTime() + LEAD_WEEKS * 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export function findBulkCode(
  code: string,
  now: Date = new Date(),
): BulkCode | null {
  if (code.trim().toLowerCase() !== BULK_CODE) return null;
  return { code: BULK_CODE, earliest: estimatedCompletion(now) };
}
