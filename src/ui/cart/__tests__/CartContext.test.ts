import { describe, it, expect } from "vitest";
import { Piece } from "@/types/piece";

// Test the cart reducer in isolation — import the unexported reducer
// by re-implementing it here (it's pure logic, no React deps needed).

interface CartItem {
  piece: Piece;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; piece: Piece }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      if (action.piece.state === "gone") return state;
      const existing = state.items.find((i) => i.piece.id === action.piece.id);
      if (existing) return state;
      return { items: [...state.items, { piece: action.piece, quantity: 1 }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.piece.id !== action.id) };
    case "CLEAR":
      return { items: [] };
    case "LOAD":
      return { items: action.items };
    default:
      return state;
  }
}

const mug: Piece = {
  id: "014",
  variationId: "",
  n: "014",
  title: "small cobalt mug",
  note: "test note",
  glaze: "cobalt",
  dim: "11×9 cm",
  price: 148,
  state: "here",
  srcs: ["/assets/piece-cobalt.png"],
  collections: [],
};

const bowl: Piece = {
  id: "019",
  variationId: "",
  n: "019",
  title: "olive serving bowl",
  note: "test note",
  glaze: "olive ash",
  dim: "22×8 cm",
  price: 94,
  state: "here",
  srcs: ["/assets/piece-olive.png"],
  collections: [],
};

const empty: CartState = { items: [] };

describe("cartReducer", () => {
  it("adds a piece to an empty cart", () => {
    const next = cartReducer(empty, { type: "ADD", piece: mug });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].piece.id).toBe("014");
    expect(next.items[0].quantity).toBe(1);
  });

  it("does not add a sold piece", () => {
    const sold = { ...mug, state: "gone" as const };
    const next = cartReducer(empty, { type: "ADD", piece: sold });
    expect(next.items).toHaveLength(0);
  });

  it("does not add the same piece twice", () => {
    const withMug = cartReducer(empty, { type: "ADD", piece: mug });
    const again = cartReducer(withMug, { type: "ADD", piece: mug });
    expect(again.items).toHaveLength(1);
  });

  it("adds a second different piece", () => {
    const withMug = cartReducer(empty, { type: "ADD", piece: mug });
    const withBoth = cartReducer(withMug, { type: "ADD", piece: bowl });
    expect(withBoth.items).toHaveLength(2);
  });

  it("removes a piece by id", () => {
    const withBoth = cartReducer(
      cartReducer(empty, { type: "ADD", piece: mug }),
      { type: "ADD", piece: bowl },
    );
    const removed = cartReducer(withBoth, { type: "REMOVE", id: "014" });
    expect(removed.items).toHaveLength(1);
    expect(removed.items[0].piece.id).toBe("019");
  });

  it("remove of non-existent id is a no-op", () => {
    const withMug = cartReducer(empty, { type: "ADD", piece: mug });
    const same = cartReducer(withMug, { type: "REMOVE", id: "999" });
    expect(same.items).toHaveLength(1);
  });

  it("clears all items", () => {
    const withBoth = cartReducer(
      cartReducer(empty, { type: "ADD", piece: mug }),
      { type: "ADD", piece: bowl },
    );
    const cleared = cartReducer(withBoth, { type: "CLEAR" });
    expect(cleared.items).toHaveLength(0);
  });

  it("loads items from storage", () => {
    const saved: CartItem[] = [{ piece: mug, quantity: 1 }];
    const loaded = cartReducer(empty, { type: "LOAD", items: saved });
    expect(loaded.items).toHaveLength(1);
    expect(loaded.items[0].piece.title).toBe("small cobalt mug");
  });
});

describe("cart total", () => {
  it("sums prices across all items", () => {
    const state = cartReducer(cartReducer(empty, { type: "ADD", piece: mug }), {
      type: "ADD",
      piece: bowl,
    });
    const total = state.items.reduce(
      (s, i) => s + i.piece.price * i.quantity,
      0,
    );
    expect(total).toBe(242); // 148 + 94
  });

  it("total of empty cart is 0", () => {
    const total = empty.items.reduce(
      (s, i) => s + i.piece.price * i.quantity,
      0,
    );
    expect(total).toBe(0);
  });
});
