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
 *
 * A drawn design has its own price per piece and size (it isn't a flat
 * upcharge), so each designable price carries both.
 */
type Price = { plain: number; design?: number };

const PRICES: Record<PieceType, Readonly<Record<Size, Price>> | Price | null> =
  {
    cup: {
      "8": { plain: 2400, design: 3000 },
      "10": { plain: 2800, design: 3400 },
      "12": { plain: 3200, design: 4000 },
    },
    "mug-with-handle": {
      "8": { plain: 2800, design: 3400 },
      "10": { plain: 3200, design: 3600 },
      "12": { plain: 3600, design: 4200 },
    },
    tumbler: {
      "8": { plain: 3400, design: 4000 },
      "10": { plain: 4000, design: 4400 },
      "12": { plain: 4600, design: 4800 },
    },
    "espresso-cup": { plain: 1500, design: 1900 },
    "cortado-cup": { plain: 2000, design: 2400 },
    "matcha-bowl": { plain: 5000, design: 5400 },
    "trinket-dish": { plain: 1500, design: 1900 },
    // something else is priced together
    other: null,
  };

/* the price entry for a piece in a size, or null when there isn't one */
function priceOf(type: PieceType, size?: OrderLine["size"]): Price | null {
  const p = PRICES[type];
  if (p === null) return null;
  if ("plain" in p) return p;
  if (!size || size === CUSTOM_SIZE) return null;
  return p[size];
}

/* pieces that can have a design drawn on them */
export const canHaveDesign = (type: PieceType) => {
  const p = PRICES[type];
  if (p === null) return false;
  return "plain" in p ? p.design !== undefined : true;
};

/* each piece's price, or null when alicia prices it by hand */
export function unitPrice(
  l: Pick<OrderLine, "type" | "size" | "design">,
): number | null {
  const p = priceOf(l.type, l.size);
  if (!p) return null;
  return l.design ? (p.design ?? null) : p.plain;
}

/* what a design adds to this piece in this size — "+$6" */
export function designExtra(
  type: PieceType,
  size?: OrderLine["size"],
): number | null {
  const p = priceOf(type, size);
  return p?.design === undefined ? null : p.design - p.plain;
}

/* the price a piece starts at — "from $24" */
export function startingPrice(type: PieceType): number | null {
  const p = PRICES[type];
  if (p === null) return null;
  if ("plain" in p) return p.plain;
  return Math.min(...Object.values(p).map((s) => s.plain));
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
