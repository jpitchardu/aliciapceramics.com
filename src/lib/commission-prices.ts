import {
  CUSTOM_SIZE,
  type OrderLine,
  type PieceType,
  type Size,
} from "@/lib/wholesale";

/*
 * Alicia's regular price sheet, in cents. These aren't Square items — the
 * commission form shows them as a running subtotal (before tax, subject to
 * change) and puts them on the draft invoice as custom-priced lines.
 * Cortado cups aren't on the sheet; their price is the shop's.
 */
const PRICES: Record<
  PieceType,
  Readonly<Record<Size, number>> | number | null
> = {
  cup: { "8": 2400, "10": 2800, "12": 3200 },
  "mug-with-handle": { "8": 2800, "10": 3200, "12": 3600 },
  tumbler: { "8": 3600, "10": 4000, "12": 4600 },
  "espresso-cup": 1500,
  "cortado-cup": 2400,
  "matcha-bowl": 5000,
  "trinket-dish": 1500,
  // something else is priced together
  other: null,
};

/* a drawn design adds the same to every size, cups, mugs and tumblers alike */
export const DESIGN_UPCHARGE = 400;

/* each piece's price, or null when alicia prices it by hand */
export function unitPrice(
  l: Pick<OrderLine, "type" | "size" | "design">,
): number | null {
  const p = PRICES[l.type];
  if (p === null) return null;
  let base: number;
  if (typeof p === "number") base = p;
  else if (!l.size || l.size === CUSTOM_SIZE) return null;
  else base = p[l.size];
  return base + (l.design ? DESIGN_UPCHARGE : 0);
}

/* the price a piece starts at — "from $24" */
export function startingPrice(type: PieceType): number | null {
  const p = PRICES[type];
  if (p === null || typeof p === "number") return p;
  return Math.min(...Object.values(p));
}

/* what the priced lines add up to, and how many lines are left to price */
export function subtotal(
  lines: readonly Pick<OrderLine, "type" | "size" | "design" | "quantity">[],
) {
  let cents = 0;
  let unpriced = 0;
  for (const l of lines) {
    const each = unitPrice(l);
    if (each === null) unpriced++;
    else cents += each * l.quantity;
  }
  return { cents, unpriced };
}

/* 2400 → "$24", 750 → "$7.50" */
export const usd = (cents: number) =>
  `$${cents % 100 ? (cents / 100).toFixed(2) : cents / 100}`;
