import { PieceOrderDetail } from "@/models/Pieces";

export type Order = {
  client: {
    email: string;
    name: string;
    phone: string;
  };
  pieceDetails: PieceOrderDetail[];
  timeline: Date;
  description: string;
  inspiration: string;
  specialConsiderations: string;
};

export const EMPTY_ORDER: Order = {
  client: {
    email: "",
    name: "",
    phone: "",
  },
  pieceDetails: [],
  description: "",
  inspiration: "",
  specialConsiderations: "",
  timeline: new Date(),
};
