import Link from "next/link";
import { Photo } from "@/ui/Photo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Badge } from "@/ui/Badge";
import { Sig } from "@/ui/Sig";
import { DesktopNav } from "@/ui/storefront/DesktopNav";
import { TopNav } from "@/ui/storefront/TopNav";
import { StorefrontFooter } from "@/ui/storefront/StorefrontFooter";
import { Piece } from "@/types/piece";

async function getPieces(): Promise<Piece[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/catalog`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("catalog fetch failed");
    return res.json();
  } catch {
    const { PLACEHOLDER_PIECES } = await import("@/lib/placeholder-pieces");
    return PLACEHOLDER_PIECES;
  }
}

export default async function ShopPage() {
  const pieces = await getPieces();
  const hereCount = pieces.filter((p) => p.state === "here").length;
  const heldCount = pieces.filter((p) => p.state === "held").length;
  const goneCount = pieces.filter((p) => p.state === "gone").length;

  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--serif)" }}>
      {/* ── MOBILE ─────────────────────────────────────────────────── */}
      <div className="lg:hidden">
        <TopNav />

        <div
          style={{
            padding: "8px 24px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <CeramicLabel color="var(--ink-faint)">
            creating spring · {pieces.length} pieces
          </CeramicLabel>
          <CeramicLabel color="var(--ink-faint)">tap a piece</CeramicLabel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px" }}>
          {pieces.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`} style={{ textDecoration: "none" }}>
              <figure style={{ margin: 0, position: "relative", cursor: "pointer" }}>
                <Badge state={p.state} compact />
                <Photo
                  ratio="4 / 5"
                  src={p.src}
                  style={{ opacity: p.state === "gone" ? 0.5 : 1 }}
                />
              </figure>
            </Link>
          ))}
        </div>

        <div style={{ margin: "56px 24px 0", padding: "28px 0 48px", borderTop: "1px solid var(--rule-soft)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <CeramicLabel color="var(--ink-faint)">aliciapceramics · brooklyn</CeramicLabel>
          <Sig size={22} color="var(--ink-soft)">a.</Sig>
        </div>
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <DesktopNav />

        {/* collection header */}
        <div style={{ padding: "64px 56px 0", textAlign: "center" }}>
          <CeramicLabel color="var(--ink-faint)">a new drop · jun 2026</CeramicLabel>
          <div style={{ marginTop: 22 }}>
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: "0.6em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              creating spring
            </span>
          </div>
          <p
            style={{
              marginTop: 22,
              fontFamily: "var(--serif)",
              fontSize: 22,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink-soft)",
              lineHeight: 1.4,
              margin: "22px auto 0",
              maxWidth: 640,
              letterSpacing: "-0.005em",
            }}
          >
            made of earth, full of His spirit — {pieces.length} new pieces, mugs,
            bowls, pitchers, the warm rooms of a slow morning.
          </p>
        </div>

        {/* meta row / filters */}
        <div
          style={{
            margin: "64px 56px 0",
            paddingBottom: 18,
            borderBottom: "1px solid var(--rule-strong)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ display: "flex", gap: 26 }}>
            {["all", "mugs", "bowls", "pitchers", "small things"].map((f, i) => (
              <CeramicLabel
                key={f}
                color={i === 0 ? "var(--ink)" : "var(--ink-faint)"}
                style={i === 0 ? { borderBottom: "1px solid var(--ink)", paddingBottom: 4 } : {}}
              >
                {f}
              </CeramicLabel>
            ))}
          </div>
          <CeramicLabel color="var(--ink-faint)">
            {hereCount} still here · {heldCount} held · {goneCount} taken
          </CeramicLabel>
        </div>

        {/* grid */}
        <div
          style={{
            padding: "40px 56px 0",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 48,
          }}
        >
          {pieces.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`} style={{ textDecoration: "none" }}>
              <figure style={{ margin: 0, cursor: "pointer" }}>
                <div style={{ position: "relative" }}>
                  <Badge state={p.state} />
                  <Photo
                    ratio="4 / 5"
                    src={p.src}
                    style={{ opacity: p.state === "gone" ? 0.5 : 1 }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 16,
                        fontStyle: "italic",
                        fontWeight: 300,
                        color: p.state === "gone" ? "var(--ink-faint)" : "var(--ink)",
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.title}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <CeramicLabel color="var(--ink-faint)" style={{ fontSize: 9 }}>
                        no. {p.n}
                      </CeramicLabel>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 15,
                      fontWeight: 300,
                      color: p.state === "gone" ? "var(--ink-faint)" : "var(--ink)",
                      textDecoration: p.state === "gone" ? "line-through" : "none",
                      flexShrink: 0,
                    }}
                  >
                    ${p.price}
                  </span>
                </div>
              </figure>
            </Link>
          ))}
        </div>

        {/* end of drop */}
        <div style={{ padding: "80px 56px 0", textAlign: "center" }}>
          <CeramicLabel color="var(--ink-faint)">
            end of drop · creating spring · jun 2026
          </CeramicLabel>
          <Sig size={32} color="var(--ink)" style={{ marginTop: 18, display: "inline-block" }}>
            — a.
          </Sig>
        </div>

        <StorefrontFooter />
      </div>
    </div>
  );
}
