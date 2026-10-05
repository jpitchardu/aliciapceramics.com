import { z } from "zod";

/*
 * The bulk (wholesale) order — shared by the /wholesale flow and its API.
 *
 * Bulk orders are invite-only: alicia gives a shop or café a code, and the
 * code carries the shop's name and the earliest date she can finish. Once in,
 * they say who they are, build a line sheet (ten pieces or more), describe
 * what they're picturing, read it all back and send it. Nobody pays here —
 * alicia follows up and invoices once the details are agreed.
 *
 * Piece type ids match the legacy commission model so existing records and
 * the scheduler keep lining up.
 */

export const MIN_PIECES = 10;
export const MAX_QTY_PER_LINE = 200;

/*
 * Alicia's real line, matched to her Square categories. For wholesale every
 * drinking piece comes in 8, 10 or 12 oz; bowls, dishes and something else
 * are one size. (Espresso and cortado cups are retail only.)
 */
export const SIZES = ["8", "10", "12"] as const;
export type Size = (typeof SIZES)[number];
export const sizeLabel = (s: Size) => `${s} oz`;

export const PIECE_TYPES = [
  "cup",
  "mug-with-handle",
  "sippy-mug",
  "matcha-bowl",
  "trinket-dish",
  "other",
] as const;
export type PieceType = (typeof PIECE_TYPES)[number];

export type CatalogEntry = {
  type: PieceType;
  label: string;
  note: string;
  sizes: readonly Size[];
};

export const CATALOG: readonly CatalogEntry[] = [
  {
    type: "cup",
    label: "cup",
    note: "a handleless mug, easy to hold and stack.",
    sizes: SIZES,
  },
  {
    type: "mug-with-handle",
    label: "mug, with handle",
    note: "the everyday mug, with a pulled handle.",
    sizes: SIZES,
  },
  {
    type: "sippy-mug",
    label: "sippy mug",
    note: "a cup with a half lid and a drinking hole, so it's easy to take with you.",
    sizes: SIZES,
  },
  {
    type: "matcha-bowl",
    label: "matcha bowl",
    note: "wide and shallow, with room to whisk.",
    sizes: [],
  },
  {
    type: "trinket-dish",
    label: "jewelry dish",
    note: "a small dish for rings, keys, and other little things.",
    sizes: [],
  },
  {
    type: "other",
    label: "something else",
    note: "have something else in mind? tell me about it.",
    sizes: [],
  },
];

export const CAT = Object.fromEntries(
  CATALOG.map((c) => [c.type, c]),
) as Record<PieceType, CatalogEntry>;

/* a new line starts on the middle size */
export const defaultSize = (c: CatalogEntry): Size | undefined =>
  c.sizes.includes("10") ? "10" : c.sizes[0];

/* the handmade timeline, the brand's "important details" reworded in voice */
export const TERMS: readonly (readonly [string, string])[] = [
  [
    "handmade nature",
    "every piece is thrown and glazed by hand, so expect small differences between them. the set will look cohesive, not identical.",
  ],
  [
    "the process",
    "handmade work doesn't always go to plan. if anything needs to change, i'll check with you first.",
  ],
  [
    "payment",
    "you won't be charged here. once we've agreed on the details, i'll send an invoice — usually a deposit to start and the balance when the order is finished.",
  ],
];

/* ── schemas ─────────────────────────────────────────────────────── */

export const codeRequestSchema = z.object({
  code: z.string().trim().min(1).max(40),
});

/* what a valid code unlocks — returned by /api/wholesale/code */
export type BulkCode = {
  code: string;
  name: string;
  /* earliest completion date, YYYY-MM-DD */
  earliest: string;
};

export const orderLineSchema = z
  .object({
    type: z.enum(PIECE_TYPES),
    size: z.enum(SIZES).optional(),
    quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
    description: z.string().trim().max(500),
  })
  .refine(
    (l) => {
      const sizes = CAT[l.type].sizes;
      return sizes.length === 0
        ? l.size === undefined
        : l.size !== undefined && sizes.includes(l.size);
    },
    { message: "that size isn't available for this piece" },
  );
export type OrderLine = z.infer<typeof orderLineSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "your name, please").max(120),
  business: z.string().trim().min(1, "the shop's name, please").max(120),
  email: z.email("that email doesn't look right"),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, {
      message: "that number looks short",
    }),
});
export type Contact = z.infer<typeof contactSchema>;

export const bulkOrderSchema = z
  .object({
    code: z.string().trim().min(1).max(40),
    contact: contactSchema,
    lines: z.array(orderLineSchema).min(1).max(50),
    inspiration: z.string().trim().max(500),
    notes: z.string().trim().max(2000),
    consent: z.literal(true),
  })
  .refine((o) => countPieces(o.lines) >= MIN_PIECES, {
    message: `a bulk order is ${MIN_PIECES} pieces or more`,
  });
export type BulkOrder = z.infer<typeof bulkOrderSchema>;

/* ── helpers ─────────────────────────────────────────────────────── */

export const countPieces = (lines: readonly Pick<OrderLine, "quantity">[]) =>
  lines.reduce((s, l) => s + l.quantity, 0);

export const lineLabel = (l: Pick<OrderLine, "type" | "size">) =>
  `${CAT[l.type].label}${l.size ? " · " + sizeLabel(l.size) : ""}`;

/* "2026-10-09" → "oct 9". Dates are calendar days, so read them as UTC. */
export function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
    .toLowerCase();
}

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/* 13 → "thirteen", 42 → "forty-two"; past 99 the digits read better */
export function numberWords(n: number) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  return n % 10 ? `${t}-${ONES[n % 10]}` : t;
}
