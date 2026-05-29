import { DesktopNav } from "@/ui/storefront/DesktopNav";
import { CartClient } from "./_components/CartClient";

export default function CartPage() {
  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--serif)" }}>
      <DesktopNav />
      <CartClient />
    </div>
  );
}
