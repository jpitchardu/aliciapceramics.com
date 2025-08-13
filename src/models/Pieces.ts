import { z } from "zod";

// const sizesConfig = {
//   "8": {
//     label: "8 oz",
//   },
//   "10": {
//     label: "10 oz",
//   },
//   "12": {
//     label: "12 oz",
//   },
// } as const;

const SizeOptions = {
  eightOunces: "8",
  tenOunces: "10",
  twelveOunces: "12",
} as const;

export type SizeOption = (typeof SizeOptions)[keyof typeof SizeOptions];

const mugWithHandleSchema = z.object({
  type: z.literal("mug-with-handle"),
  size: z.enum(Object.values(SizeOptions)),
});

const mugWithoutHandleSchema = z.object({
  type: z.literal("mug-without-handle"),
  size: z.enum(Object.values(SizeOptions)),
});

const tumblerSchema = z.object({
  type: z.literal("tumbler"),
  size: z.enum(Object.values(SizeOptions)),
});

const matchaBowlSchema = z.object({
  type: z.literal("matcha-bowl"),
});

const trinketDishSchema = z.object({
  type: z.literal("trinket-dish"),
});

const dinnerwareSchema = z.object({
  type: z.literal("dinnerware"),
});

const otherSchema = z.object({
  type: z.literal("other"),
});

const pieceSchema = z.discriminatedUnion("type", [
  mugWithHandleSchema,
  mugWithoutHandleSchema,
  tumblerSchema,
  matchaBowlSchema,
  trinketDishSchema,
  dinnerwareSchema,
  otherSchema,
]);

export type Piece = z.infer<typeof pieceSchema>;

const pieceOrderDetailSchema = pieceSchema.and(
  z.object({
    quantity: z.number(),
    description: z.string(),
  })
);

export type PieceOrderDetail = z.infer<typeof pieceOrderDetailSchema>;

type PieceConfig = {
  label: string;
  icon: string;
  sizes: SizeOption[];
};

const piecesConfigByType: Record<Piece["type"], PieceConfig> = {
  "mug-with-handle": {
    label: "mug w/ handle",
    icon: "/icons/mug_with_handle.png",
    sizes: [
      SizeOptions.eightOunces,
      SizeOptions.tenOunces,
      SizeOptions.twelveOunces,
    ],
  },
  "mug-without-handle": {
    label: "mug w/o handle",
    icon: "/icons/mug_without_handle.png",
    sizes: [
      SizeOptions.eightOunces,
      SizeOptions.tenOunces,
      SizeOptions.twelveOunces,
    ],
  },
  tumbler: {
    label: "tumbler",
    icon: "/icons/tumbler.png",
    sizes: [
      SizeOptions.eightOunces,
      SizeOptions.tenOunces,
      SizeOptions.twelveOunces,
    ],
  },
  "matcha-bowl": {
    label: "matcha bowl",
    icon: "/icons/matcha_bowl.png",
    sizes: [],
  },
  "trinket-dish": {
    label: "trinket dish",
    icon: "/icons/trinket_dish.png",
    sizes: [],
  },
  dinnerware: {
    label: "dinnerware",
    icon: "/icons/plate.png",
    sizes: [],
  },
  other: {
    label: "other",
    icon: "/icons/vase.png",
    sizes: [],
  },
} as const;

export function getConfigByPieceType(type: Piece["type"]): PieceConfig {
  return piecesConfigByType[type];
}

export function getAllPieceTypes(): readonly Piece["type"][] {
  return Object.keys(piecesConfigByType) as Piece["type"][];
}

export function isSizedPiece(piece: Piece): piece is Piece & { size: number } {
  return (
    ["mug-with-handle", "mug-without-handle", "tumbler"].includes(piece.type) &&
    "size" in piece
  );
}
