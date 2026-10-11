import { z } from "zod";

/*
 * The bulk (wholesale) order and the small commission — shared by the
 * /wholesale and /commission flows and their APIs. Both run the same steps;
 * they differ in their code, how many pieces they take, and whether prices
 * are shown (commissions are priced from the regular price sheet).
 *
 * Bulk orders are invite-only: alicia shares one code with the shops and
 * cafés she's talked to. Unlocking it also sets the estimated completion
 * date, a fixed lead time from the day they order. Once in,
 * they say who they are, build a line sheet (ten pieces or more), describe
 * what they're picturing, read it all back and send it. Nobody pays here —
 * alicia follows up and invoices once the details are agreed.
 *
 * Piece type ids match the legacy commission model so existing records and
 * the scheduler keep lining up.
 */

export const MIN_PIECES = 10;
export const MAX_QTY_PER_LINE = 200;

export const ORDER_KINDS = ["wholesale", "commission"] as const;
export type OrderKind = (typeof ORDER_KINDS)[number];

/* how many pieces each kind takes: bulk is ten or more, a small commission one to nine */
export const PIECE_RANGE: Record<OrderKind, { min: number; max: number }> = {
  wholesale: { min: MIN_PIECES, max: Number.POSITIVE_INFINITY },
  commission: { min: 1, max: MIN_PIECES - 1 },
};

/*
 * Alicia's real line, matched to her Square categories. Cups, mugs and
 * tumblers come in 8, 10 or 12 oz; espresso and cortado cups, bowls, dishes
 * and something else are one size.
 */
export const SIZES = ["8", "10", "12"] as const;
export type Size = (typeof SIZES)[number];
export const sizeLabel = (s: Size) => `${s} oz`;

/* any sized piece can also be asked for in a size of their own, described in words */
export const CUSTOM_SIZE = "custom" as const;
export const MAX_CUSTOM_SIZE = 60;
export type LineSize = Size | typeof CUSTOM_SIZE;

export const PIECE_TYPES = [
  "cup",
  "mug-with-handle",
  "tumbler",
  "espresso-cup",
  "cortado-cup",
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
    note: "a handleless cup, easy to hold.",
    sizes: SIZES,
  },
  {
    type: "mug-with-handle",
    label: "mug, with handle",
    note: "the everyday mug, with a pulled handle.",
    sizes: SIZES,
  },
  {
    type: "tumbler",
    label: "tumbler",
    note: "a cup with a half lid and a drinking hole, so it's easy to take with you.",
    sizes: SIZES,
  },
  {
    type: "espresso-cup",
    label: "espresso cup",
    note: "a little cup for a single or a double shot.",
    sizes: [],
  },
  {
    type: "cortado-cup",
    label: "cortado cup",
    note: "a small cup for a cortado or a short pour.",
    sizes: [],
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
const HANDMADE_TERMS: readonly (readonly [string, string])[] = [
  [
    "handmade nature",
    "every piece is thrown and glazed by hand, so expect small differences between them. the set will look cohesive, not identical.",
  ],
  [
    "the process",
    "handmade work doesn't always go to plan. if anything needs to change, i'll check with you first.",
  ],
];

export const TERMS: Record<OrderKind, readonly (readonly [string, string])[]> =
  {
    wholesale: [
      ...HANDMADE_TERMS,
      [
        "payment",
        "you won't be charged here. once we've agreed on the details, i'll send an invoice — usually a deposit to start and the balance when the order is finished.",
      ],
    ],
    commission: [
      ...HANDMADE_TERMS,
      [
        "price & payment",
        "the prices here are a subtotal before tax, and they're subject to change. you won't be charged here — once we've agreed on the details, i'll send an invoice, usually a deposit to start and the balance when it's finished.",
      ],
    ],
  };

/* ── schemas ─────────────────────────────────────────────────────── */

export const codeRequestSchema = z.object({
  code: z.string().trim().min(1).max(40),
});

/* what a valid code unlocks — returned by /api/wholesale/code */
export type BulkCode = {
  code: string;
  /* estimated completion date, YYYY-MM-DD */
  earliest: string;
};

export const orderLineSchema = z
  .object({
    type: z.enum(PIECE_TYPES),
    size: z.enum([...SIZES, CUSTOM_SIZE]).optional(),
    customSize: z.string().trim().max(MAX_CUSTOM_SIZE).optional(),
    /* a drawn design on a cup, mug or tumbler — commissions only, +$4 a piece */
    design: z.boolean().optional(),
    quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
    description: z.string().trim().max(500),
  })
  .refine(
    (l) => {
      const sizes = CAT[l.type].sizes;
      return sizes.length === 0
        ? l.size === undefined
        : l.size === CUSTOM_SIZE ||
            (l.size !== undefined && sizes.includes(l.size));
    },
    { message: "that size isn't available for this piece" },
  )
  .refine((l) => l.size !== CUSTOM_SIZE || !!l.customSize, {
    message: "what size are you after?",
    path: ["customSize"],
  })
  .refine((l) => !l.design || CAT[l.type].sizes.length > 0, {
    message: "a design is only for cups, mugs and tumblers",
    path: ["design"],
  });
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

/* a commission is for a person — the shop's name is optional */
export const contactSchemaFor = (kind: OrderKind) =>
  kind === "wholesale"
    ? contactSchema
    : contactSchema.extend({ business: z.string().trim().max(120) });

export const orderSchemaFor = (kind: OrderKind) => {
  const { min, max } = PIECE_RANGE[kind];
  return z
    .object({
      /* generated once per order on the client — keeps retries idempotent */
      submissionId: z.uuid(),
      code: z.string().trim().min(1).max(40),
      contact: contactSchemaFor(kind),
      lines: z.array(orderLineSchema).min(1).max(50),
      inspiration: z.string().trim().max(500),
      notes: z.string().trim().max(2000),
      consent: z.literal(true),
    })
    .refine((o) => countPieces(o.lines) >= min && countPieces(o.lines) <= max, {
      message:
        kind === "wholesale"
          ? `a bulk order is ${min} pieces or more`
          : `a small commission is ${min} to ${max} pieces`,
    });
};
export const bulkOrderSchema = orderSchemaFor("wholesale");
export type BulkOrder = z.infer<typeof bulkOrderSchema>;

/* ── helpers ─────────────────────────────────────────────────────── */

export const countPieces = (lines: readonly Pick<OrderLine, "quantity">[]) =>
  lines.reduce((s, l) => s + l.quantity, 0);

/* "12 oz", or for a custom size "custom: 16 oz" */
export const lineSize = (l: Pick<OrderLine, "size" | "customSize">) =>
  !l.size
    ? ""
    : l.size === CUSTOM_SIZE
      ? `custom: ${l.customSize ?? ""}`
      : sizeLabel(l.size);

export const lineLabel = (
  l: Pick<OrderLine, "type" | "size" | "customSize" | "design">,
) =>
  `${CAT[l.type].label}${l.size ? " · " + lineSize(l) : ""}${
    l.design ? " · with a design" : ""
  }`;

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
