export type PieceState = "here" | "held" | "gone";

export interface Piece {
  id: string;
  n: string;
  title: string;
  note: string;
  glaze: string;
  dim: string;
  price: number;
  state: PieceState;
  src: string;
  collection?: string;
}
