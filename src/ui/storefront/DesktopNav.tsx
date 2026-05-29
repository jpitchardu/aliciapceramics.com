import Link from "next/link";
import { Logo } from "@/ui/Logo";
import { CeramicLabel } from "@/ui/CeramicLabel";

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
            <CeramicLabel color="var(--ink-soft)">ceramics</CeramicLabel>
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
            href="https://instagram.com/aliciapceramics"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <CeramicLabel color="var(--ink-soft)">
              @aliciapceramics
            </CeramicLabel>
          </a>
          <Link href="/shop" style={{ textDecoration: "none" }}>
            <CeramicLabel color="var(--ink-soft)">enter the shop</CeramicLabel>
          </Link>
        </div>
      </div>
    </div>
  );
}
