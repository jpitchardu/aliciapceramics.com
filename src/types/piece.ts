export type PieceState = "here" | "gone";

export interface Piece {
  id: string;
  variationId: string;
  n: string;
  title: string;
  note: string;
  glaze: string;
  dim: string;
  price: number;
  state: PieceState;
  quantity: number;
  srcs: string[];
  collections: string[];
}
