"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/ui/cart/CartContext";
import { Piece } from "@/types/piece";

export function AddToCartButton({ piece }: { piece: Piece }) {
  const { addItem } = useCart();
  const router = useRouter();

  if (piece.state === "gone") {
    return (
      <span
        style={{
          fontFamily: "var(--serif)",
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--ink-faint)",
        }}
      >
        taken
      </span>
    );
  }

  return (
    <button
      onClick={() => {
        addItem(piece);
        router.push("/cart");
      }}
      className="ds-action"
    >
      add to cart
    </button>
  );
}
