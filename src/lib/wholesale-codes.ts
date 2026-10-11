import type { BulkCode, OrderKind } from "@/lib/wholesale";

/*
 * The one code per flow that alicia shares: the bulk code with the shops
 * she's talked to, the commission code with people she's said yes to. Codes
 * match case-insensitively.
 *
 * The estimated completion date is the lead time from the day of the order:
 * about a week to talk and design, about ten to throw and fire. It's kept
 * long on purpose — her schedule can change fast.
 */

export const CODES: Record<OrderKind, string> = {
  wholesale: "buy-more-mugs",
  commission: "little-cute-mugs",
};
export const BULK_CODE = CODES.wholesale;
export const LEAD_WEEKS = 12;

export const isProduction = () => process.env.VERCEL_ENV === "production";

/* the calendar day LEAD_WEEKS after `now`, as YYYY-MM-DD */
export function estimatedCompletion(now: Date): string {
  const d = new Date(now.getTime() + LEAD_WEEKS * 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export function findCode(
  kind: OrderKind,
  code: string,
  now: Date = new Date(),
): BulkCode | null {
  if (code.trim().toLowerCase() !== CODES[kind]) return null;
  return { code: CODES[kind], earliest: estimatedCompletion(now) };
}

export const findBulkCode = (code: string, now?: Date) =>
  findCode("wholesale", code, now);
