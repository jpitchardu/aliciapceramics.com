import type { BulkCode } from "@/lib/wholesale";

/*
 * One bulk code, shared with every shop alicia has talked to, set in the
 * WHOLESALE_CODE env var. It matches case-insensitively. Outside production
 * an unset variable falls back to a demo code so previews and local dev can
 * walk the whole flow.
 *
 * The estimated completion date is the lead time from the day of the order:
 * about a week to talk and design, about ten to throw and fire.
 */

export const LEAD_WEEKS = 12;
const DEMO_CODE = "BLOOM-24";

export const isProduction = () => process.env.VERCEL_ENV === "production";

function activeCode(): string | null {
  const code = process.env.WHOLESALE_CODE?.trim();
  if (code) return code;
  return isProduction() ? null : DEMO_CODE;
}

/* the calendar day LEAD_WEEKS after `now`, as YYYY-MM-DD */
export function estimatedCompletion(now: Date): string {
  const d = new Date(now.getTime() + LEAD_WEEKS * 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export function findBulkCode(
  code: string,
  now: Date = new Date(),
): BulkCode | null {
  const active = activeCode();
  if (!active || code.trim().toUpperCase() !== active.toUpperCase()) {
    return null;
  }
  return { code: active, earliest: estimatedCompletion(now) };
}
