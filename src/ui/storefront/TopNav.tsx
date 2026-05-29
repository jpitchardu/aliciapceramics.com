import Link from "next/link";
import { Logo } from "@/ui/Logo";
import { CeramicLabel } from "@/ui/CeramicLabel";

export function TopNav() {
  return (
    <div
      style={{
        padding: "20px 24px 18px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 20 }}>
        <Link href="/shop" style={{ textDecoration: "none" }}>
          <CeramicLabel color="var(--ink-soft)">shop</CeramicLabel>
        </Link>
        <Link
          href="/shop?collection=archive"
          style={{ textDecoration: "none" }}
        >
          <CeramicLabel color="var(--ink-soft)">archive</CeramicLabel>
        </Link>
      </div>
      <Link href="/">
        <Logo width={108} />
      </Link>
      <Link href="/cart" style={{ textDecoration: "none", justifySelf: "end" }}>
        <CeramicLabel color="var(--ink-soft)">cart</CeramicLabel>
      </Link>
    </div>
  );
}
