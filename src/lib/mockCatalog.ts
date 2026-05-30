import { Piece } from "@/types/piece";
import { Category } from "@/lib/square";

export const MOCK_PIECES: Piece[] = [
  {
    id: "mock-014-id",
    n: "014",
    title: "cobalt mug",
    note: "a nice mug",
    glaze: "cobalt",
    dim: "3.5in",
    price: 85,
    state: "here",
    src: "/assets/photo-placeholder.png",
    collection: "mock-cat-1",
  },
  {
    id: "mock-015",
    n: "015",
    title: "blush bowl",
    note: "a bowl",
    glaze: "blush",
    dim: "4in",
    price: 95,
    state: "here",
    src: "/assets/photo-placeholder.png",
    collection: "mock-cat-1",
  },
  {
    id: "mock-016",
    n: "016",
    title: "speckled cup",
    note: "a cup",
    glaze: "speckled white",
    dim: "3in",
    price: 75,
    state: "gone",
    src: "/assets/photo-placeholder.png",
  },
];

export const MOCK_CATEGORIES: Category[] = [{ id: "mock-cat-1", name: "mugs" }];
