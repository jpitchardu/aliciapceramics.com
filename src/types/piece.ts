export type PieceState = "here" | "gone";

export interface Piece {
  id: string;
  n: string;
  title: string;
  note: string;
  glaze: string;
  dim: string;
  price: number;
  state: PieceState;
  srcs: string[];
  collections: string[];
}
