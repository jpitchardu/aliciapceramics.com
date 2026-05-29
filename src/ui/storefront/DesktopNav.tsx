import Link from "next/link";
import { Logo } from "@/ui/Logo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { SITE } from "@/lib/config";

export function DesktopNav() {
  return (
    <div
      style={{
        padding: "40px 56px 24px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 36 }}>
        <Link href="/shop" style={{ textDecoration: "none" }}>
          <CeramicLabel color="var(--ink-soft)">shop</CeramicLabel>
        </Link>
        <Link
          href="/shop?collection=archive"
          style={{ textDecoration: "none" }}
        >
          <CeramicLabel color="var(--ink-soft)">archive</CeramicLabel>
        </Link>
        <a
          href={`https://instagram.com/${SITE.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <CeramicLabel color="var(--ink-soft)">@{SITE.instagram}</CeramicLabel>
        </a>
      </div>

      <Link href="/" style={{ justifySelf: "center" }}>
        <Logo width={200} />
      </Link>

      <div style={{ justifySelf: "end" }}>
        <Link href="/cart" style={{ textDecoration: "none" }}>
          <CeramicLabel color="var(--ink-soft)">cart</CeramicLabel>
        </Link>
      </div>
    </div>
  );
}
