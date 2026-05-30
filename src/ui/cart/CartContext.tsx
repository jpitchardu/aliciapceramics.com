"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Piece } from "@/types/piece";

export interface CartItem {
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

interface CartContextValue {
  items: CartItem[];
  addItem: (piece: Piece) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch({
            type: "LOAD",
            items: parsed.filter(
              (i) => i?.piece?.id && Array.isArray(i.piece.srcs),
            ),
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((s, i) => s + i.piece.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem: (piece) => dispatch({ type: "ADD", piece }),
        removeItem: (id) => dispatch({ type: "REMOVE", id }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
