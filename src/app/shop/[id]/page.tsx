import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/ui/Photo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Badge } from "@/ui/Badge";
import { DesktopNav } from "@/ui/storefront/DesktopNav";
import { StorefrontFooter } from "@/ui/storefront/StorefrontFooter";
import { AddToCartButton } from "./_components/AddToCartButton";
import { Piece } from "@/types/piece";
import { PLACEHOLDER_PIECES } from "@/lib/placeholder-pieces";

async function getPiece(id: string): Promise<Piece | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/catalog/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return PLACEHOLDER_PIECES.find((p) => p.id === id) ?? null;
  }
}

async function getAllPieces(): Promise<Piece[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/catalog`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return PLACEHOLDER_PIECES;
    return res.json();
  } catch {
    return PLACEHOLDER_PIECES;
  }
}

export default async function PieceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [piece, allPieces] = await Promise.all([getPiece(id), getAllPieces()]);

  if (!piece) notFound();

  const morePieces = allPieces.filter((p) => p.id !== id).slice(0, 4);
  const pieceIndex = allPieces.findIndex((p) => p.id === id);

  return (
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
      }}
    >
      {/* ── MOBILE ─────────────────────────────────────────────────── */}
      <div className="lg:hidden">
        {/* nav: back → wordmark */}
        <div
          style={{
            padding: "20px 24px 14px",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
          }}
        >
          <Link
            href="/shop"
            style={{ textDecoration: "none", justifySelf: "start" }}
          >
            <CeramicLabel color="var(--ink-soft)">← all pieces</CeramicLabel>
          </Link>
          <Link href="/">
            <CeramicLabel
              color="var(--ink)"
              style={{ fontSize: 14, letterSpacing: "0.15em" }}
            >
              alicia p.
            </CeramicLabel>
          </Link>
          <span />
        </div>

        {/* hero */}
        <div style={{ position: "relative" }}>
          <Badge state={piece.state} />
          <Photo ratio="4 / 5" src={piece.src} />
        </div>

        {/* title */}
        <div style={{ padding: "32px 28px 0" }}>
          <CeramicLabel color="var(--ink-faint)">
            no. {piece.n} · creating spring
          </CeramicLabel>
          <div
            style={{
              marginTop: 14,
              fontFamily: "var(--serif)",
              fontSize: 38,
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.0,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}
          >
            {piece.title}.
          </div>
          <p
            style={{
              marginTop: 18,
              fontFamily: "var(--serif)",
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--ink)",
              margin: "18px 0 0",
              fontStyle: "italic",
              fontWeight: 300,
            }}
          >
            {piece.note}
          </p>
        </div>

        {/* specs */}
        <div style={{ padding: "36px 28px 0" }}>
          <CeramicLabel color="var(--ink-faint)">about this piece</CeramicLabel>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "16px 0 0",
              fontFamily: "var(--serif)",
              fontSize: 16,
              fontWeight: 300,
              fontStyle: "italic",
              color: "var(--ink)",
              lineHeight: 1.9,
            }}
          >
            {piece.glaze && <li>glazed in {piece.glaze}</li>}
            {piece.dim && <li>{piece.dim}, wheel-thrown stoneware</li>}
            <li>food safe, dishwasher fine</li>
            <li>ships from brooklyn — or pick up in studio</li>
          </ul>
        </div>

        {/* action */}
        <div
          style={{
            margin: "36px 28px 0",
            padding: "24px 0",
            borderTop: "1px solid var(--rule-strong)",
            borderBottom: "1px solid var(--rule-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div>
            <CeramicLabel color="var(--ink-faint)">price</CeramicLabel>
            <div
              style={{
                marginTop: 6,
                fontFamily: "var(--serif)",
                fontSize: 28,
                fontStyle: "italic",
                fontWeight: 300,
                color:
                  piece.state === "gone" ? "var(--ink-faint)" : "var(--ink)",
                textDecoration:
                  piece.state === "gone" ? "line-through" : "none",
                letterSpacing: "-0.005em",
              }}
            >
              ${piece.price}
            </div>
          </div>
          <AddToCartButton piece={piece} />
        </div>

        {/* second photo */}
        <div style={{ padding: "40px 0 0" }}>
          <Photo ratio="1 / 1" src="/assets/piece-cream.png" />
          <div style={{ padding: "12px 28px" }}>
            <CeramicLabel color="var(--ink-faint)">
              fig. 02 · in the studio
            </CeramicLabel>
          </div>
        </div>

        {/* back */}
        <div
          style={{
            margin: "40px 28px 0",
            padding: "28px 0 48px",
            borderTop: "1px solid var(--rule-soft)",
          }}
        >
          <Link href="/shop" style={{ textDecoration: "none" }}>
            <CeramicLabel color="var(--ink-faint)">
              ← back to all pieces
            </CeramicLabel>
          </Link>
        </div>
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <DesktopNav />

        {/* breadcrumb */}
        <div
          style={{
            padding: "20px 56px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Link href="/shop" style={{ textDecoration: "none" }}>
            <CeramicLabel color="var(--ink-soft)">
              ← creating spring
            </CeramicLabel>
          </Link>
          <CeramicLabel color="var(--ink-faint)">
            no. {piece.n} · piece {pieceIndex + 1} of {allPieces.length}
          </CeramicLabel>
        </div>

        {/* hero — large photo + info */}
        <div
          style={{
            padding: "0 56px",
            display: "grid",
            gridTemplateColumns: "1.35fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div style={{ position: "relative" }}>
            <Badge state={piece.state} />
            <Photo ratio="4 / 5" src={piece.src} />
          </div>

          <div style={{ paddingTop: 24 }}>
            <CeramicLabel color="var(--ink-faint)">
              no. {piece.n} · creating spring
            </CeramicLabel>
            <div
              style={{
                marginTop: 18,
                fontFamily: "var(--serif)",
                fontSize: 56,
                fontStyle: "italic",
                fontWeight: 300,
                lineHeight: 1.0,
                color: "var(--ink)",
                letterSpacing: "-0.015em",
              }}
            >
              {piece.title}.
            </div>
            <p
              style={{
                marginTop: 24,
                fontFamily: "var(--serif)",
                fontSize: 19,
                lineHeight: 1.55,
                color: "var(--ink)",
                margin: "24px 0 0",
                fontStyle: "italic",
                fontWeight: 300,
                maxWidth: 460,
              }}
            >
              {piece.note}
            </p>

            {/* specs */}
            <div style={{ marginTop: 44 }}>
              <CeramicLabel color="var(--ink-faint)">
                about this piece
              </CeramicLabel>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "18px 0 0",
                  fontFamily: "var(--serif)",
                  fontSize: 17,
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "var(--ink)",
                  lineHeight: 1.9,
                }}
              >
                {piece.glaze && <li>glazed in {piece.glaze}</li>}
                {piece.dim && <li>{piece.dim}, wheel-thrown stoneware</li>}
                <li>food safe, dishwasher fine</li>
                <li>ships from brooklyn — or pick up in studio</li>
              </ul>
            </div>

            {/* action */}
            <div
              style={{
                marginTop: 48,
                paddingTop: 28,
                paddingBottom: 28,
                borderTop: "1px solid var(--rule-strong)",
                borderBottom: "1px solid var(--rule-soft)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div>
                <CeramicLabel color="var(--ink-faint)">price</CeramicLabel>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "var(--serif)",
                    fontSize: 36,
                    fontStyle: "italic",
                    fontWeight: 300,
                    color:
                      piece.state === "gone"
                        ? "var(--ink-faint)"
                        : "var(--ink)",
                    textDecoration:
                      piece.state === "gone" ? "line-through" : "none",
                    letterSpacing: "-0.005em",
                  }}
                >
                  ${piece.price}
                </div>
              </div>
              <AddToCartButton piece={piece} />
            </div>

            <p
              style={{
                marginTop: 18,
                fontFamily: "var(--serif)",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--ink-soft)",
                fontStyle: "italic",
                fontWeight: 300,
                margin: "18px 0 0",
              }}
            >
              held for you for 24 hours. ships from brooklyn the morning after.
            </p>
          </div>
        </div>

        {/* second photo — in context */}
        <div
          style={{
            margin: "120px 56px 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div>
            <CeramicLabel color="var(--ink-faint)">
              fig. 02 · in the studio
            </CeramicLabel>
            <p
              style={{
                marginTop: 18,
                fontFamily: "var(--serif)",
                fontSize: 22,
                fontStyle: "italic",
                fontWeight: 300,
                lineHeight: 1.45,
                color: "var(--ink)",
                margin: "18px 0 0",
                letterSpacing: "-0.005em",
                maxWidth: 480,
              }}
            >
              photographed on the windowsill the morning it came out of the
              kiln, next to a cream pitcher (no. 016) that didn&apos;t make this
              drop.
            </p>
          </div>
          <Photo ratio="1 / 1" src="/assets/piece-cream.png" />
        </div>

        {/* more from the drop */}
        {morePieces.length > 0 && (
          <div style={{ padding: "140px 56px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                paddingBottom: 22,
                borderBottom: "1px solid var(--rule-strong)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 14,
                  fontWeight: 300,
                  letterSpacing: "0.6em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                }}
              >
                more from creating spring
              </span>
              <Link href="/shop" style={{ textDecoration: "none" }}>
                <CeramicLabel
                  color="var(--ink-soft)"
                  style={{
                    borderBottom: "1px solid var(--ink)",
                    paddingBottom: 4,
                  }}
                >
                  see all {allPieces.length} →
                </CeramicLabel>
              </Link>
            </div>
            <div
              style={{
                marginTop: 40,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 32,
              }}
            >
              {morePieces.map((m) => (
                <Link
                  key={m.id}
                  href={`/shop/${m.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <figure style={{ margin: 0, cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <Badge state={m.state} compact />
                      <Photo
                        ratio="4 / 5"
                        src={m.src}
                        style={{ opacity: m.state === "gone" ? 0.5 : 1 }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: 14,
                          fontStyle: "italic",
                          fontWeight: 300,
                          color:
                            m.state === "gone"
                              ? "var(--ink-faint)"
                              : "var(--ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.title}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: 13,
                          fontWeight: 300,
                          color:
                            m.state === "gone"
                              ? "var(--ink-faint)"
                              : "var(--ink)",
                          textDecoration:
                            m.state === "gone" ? "line-through" : "none",
                          flexShrink: 0,
                        }}
                      >
                        ${m.price}
                      </span>
                    </div>
                  </figure>
                </Link>
              ))}
            </div>
          </div>
        )}

        <StorefrontFooter />
      </div>
    </div>
  );
}
