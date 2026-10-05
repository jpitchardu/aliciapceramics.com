import { z } from "zod";
import type { BulkCode } from "@/lib/wholesale";

/*
 * Bulk codes live in the WHOLESALE_CODES env var until they move into Square:
 *
 *   WHOLESALE_CODES='[{"code":"BLOOM-24","name":"still life coffee","earliest":"2026-12-15"}]'
 *
 * Codes match case-insensitively. Outside production, an unset variable falls
 * back to a demo code so previews and local dev can walk the whole flow.
 */

const codesSchema = z.array(
  z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    earliest: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
);

const DEMO_CODES: BulkCode[] = [
  { code: "BLOOM-24", name: "still life coffee", earliest: "2026-12-15" },
];

export const isProduction = () => process.env.VERCEL_ENV === "production";

function loadCodes(): BulkCode[] {
  const raw = process.env.WHOLESALE_CODES;
  if (!raw) return isProduction() ? [] : DEMO_CODES;
  try {
    return codesSchema.parse(JSON.parse(raw));
  } catch {
    // a malformed variable shouldn't take the page down — it just unlocks nothing
    return [];
  }
}

export function findBulkCode(code: string): BulkCode | null {
  const wanted = code.trim().toUpperCase();
  return loadCodes().find((c) => c.code.toUpperCase() === wanted) ?? null;
}
