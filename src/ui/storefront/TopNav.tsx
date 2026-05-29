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
      <Link href="/shop" style={{ textDecoration: "none", justifySelf: "start" }}>
        <CeramicLabel color="var(--ink-soft)">ceramics</CeramicLabel>
      </Link>
      <Link href="/">
        <Logo width={108} />
      </Link>
      <Link href="/shop?collection=archive" style={{ textDecoration: "none", justifySelf: "end" }}>
        <CeramicLabel color="var(--ink-soft)">archive</CeramicLabel>
      </Link>
    </div>
  );
}
