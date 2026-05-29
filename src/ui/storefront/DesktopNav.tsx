import Link from "next/link";
import { Logo } from "@/ui/Logo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { SITE } from "@/lib/config";

export function DesktopNav() {
  return (
    <div style={{ padding: "40px 56px 24px" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Link href="/">
          <Logo width={200} />
        </Link>
      </div>
      <div
        style={{
          marginTop: 26,
          paddingTop: 18,
          borderTop: "1px solid var(--rule-soft)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
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
        </div>
        <div style={{ display: "flex", gap: 36 }}>
          <a
            href={`https://instagram.com/${SITE.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <CeramicLabel color="var(--ink-soft)">
              @{SITE.instagram}
            </CeramicLabel>
          </a>
          <Link href="/cart" style={{ textDecoration: "none" }}>
            <CeramicLabel color="var(--ink-soft)">cart</CeramicLabel>
          </Link>
        </div>
      </div>
    </div>
  );
}
