const sizeOptions = [
  {
    _tag: "size",
    label: "8 oz",
    value: 8,
  },
  {
    _tag: "size",
    label: "10 oz",
    value: 10,
  },
  {
    _tag: "size",
    label: "12 oz",
    value: 12,
  },
] as const;

export type SizeOption = (typeof sizeOptions)[number];

type MugWithHandle = {
  type: "mug-with-handle";
  size: SizeOption["value"];
};

type MugWithoutHandle = {
  type: "mug-without-handle";
  size: SizeOption["value"];
};

type Tumbler = {
  type: "tumbler";
  size: SizeOption["value"];
};

type MatchaBowl = {
  type: "matcha-bowl";
};

type TrinketDish = {
  type: "trinket-dish";
};

type Dinnerware = {
  type: "dinnerware";
};

type Other = {
  type: "other";
};

export type Piece =
  | MugWithHandle
  | MugWithoutHandle
  | Tumbler
  | MatchaBowl
  | TrinketDish
  | Dinnerware
  | Other;

export type PieceOrderDetail = Piece & {
  id?: string;
  quantity: number;
  comments?: string;
};

type PieceConfig<T extends Piece> = {
  label: string;
  icon: string;
} & (T extends MugWithHandle | MugWithoutHandle | Tumbler
  ? { sized: true }
  : { sized: false });

const piecesConfigByType: {
  [K in Piece["type"]]: PieceConfig<Extract<Piece, { type: K }>>;
} = {
  "mug-with-handle": {
    label: "Mug W/ Handle",
    icon: "/icons/mug_with_handle.png",
    sized: true,
  },
  "mug-without-handle": {
    label: "Mug W/O Handle",
    icon: "/icons/mug_without_handle.png",
    sized: true,
  },
  tumbler: {
    label: "Tumbler",
    icon: "/icons/tumbler.png",
    sized: true,
  },
  "matcha-bowl": {
    label: "Matcha Bowl",
    icon: "/icons/matcha_bowl.png",
    sized: false,
  },
  "trinket-dish": {
    label: "Trinket Dish",
    icon: "/icons/trinket_dish.png",
    sized: false,
  },
  dinnerware: {
    label: "Dinnerware",
    icon: "/icons/plate.png",
    sized: false,
  },
  other: {
    label: "Other",
    icon: "/icons/vase.png",
    sized: false,
  },
};

export function getConfigByPieceType<T extends Piece["type"]>(
  type: T
): PieceConfig<Extract<Piece, { type: T }>> {
  return piecesConfigByType[type];
}

export function getAllPieceTypes(): readonly Piece["type"][] {
  return Object.keys(piecesConfigByType) as Piece["type"][];
}

export function getAllSizes(): SizeOption[] {
  return [...sizeOptions];
}

export function isSizedPiece(
  piece: Piece
): piece is MugWithHandle | MugWithoutHandle | Tumbler {
  return ["mug-with-handle", "mug-without-handle", "tumbler"].includes(
    piece.type
  );
}
