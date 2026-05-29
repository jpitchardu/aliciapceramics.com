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
      <Link
        href="/shop"
        style={{ textDecoration: "none", justifySelf: "start" }}
      >
        <CeramicLabel color="var(--ink-soft)">ceramics</CeramicLabel>
      </Link>
      <Link href="/">
        <Logo width={108} />
      </Link>
      <div style={{ justifySelf: "end", display: "flex", gap: 20 }}>
        <Link
          href="/shop?collection=archive"
          style={{ textDecoration: "none" }}
        >
          <CeramicLabel color="var(--ink-soft)">archive</CeramicLabel>
        </Link>
        <Link href="/cart" style={{ textDecoration: "none" }}>
          <CeramicLabel color="var(--ink-soft)">cart</CeramicLabel>
        </Link>
      </div>
    </div>
  );
}
