import { CartClient } from "./_components/CartClient";

export default function CartPage() {
  return (
    <div style={{ color: "var(--ink)", fontFamily: "var(--serif)" }}>
      <h1 className="sr-only">your cart</h1>
      <CartClient />
    </div>
  );
}
