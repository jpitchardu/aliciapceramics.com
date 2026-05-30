import { DROP } from "@/lib/config";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/ui/Photo";
import { ImageGallery } from "@/ui/ImageGallery";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Badge } from "@/ui/Badge";
import { AddToCartButton } from "./_components/AddToCartButton";
import { fetchAllPieces, fetchPieceById } from "@/lib/square";

export default async function PieceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pieceResult, allPiecesResult] = await Promise.allSettled([
    fetchPieceById(id),
    fetchAllPieces(),
  ]);

  const piece = pieceResult.status === "fulfilled" ? pieceResult.value : null;
  if (!piece) notFound();

  const allPieces =
    allPiecesResult.status === "fulfilled" ? allPiecesResult.value : [];
  const morePieces = allPieces.filter((p) => p.id !== id).slice(0, 4);
  const pieceIndex = allPieces.findIndex((p) => p.id === id);

  return (
    <div style={{ color: "var(--ink)", fontFamily: "var(--serif)" }}>
      {/* ── MOBILE ─────────────────────────────────────────────────── */}
      <div className="lg:hidden">
        <div style={{ padding: "0 24px 16px" }}>
          <Link href="/shop" style={{ textDecoration: "none" }}>
            <CeramicLabel color="var(--ink-soft)">← all pieces</CeramicLabel>
          </Link>
        </div>

        <div style={{ position: "relative" }}>
          <Badge state={piece.state} />
          <ImageGallery srcs={piece.srcs} ratio="4 / 5" />
        </div>

        <div style={{ padding: "32px 28px 0" }}>
          <CeramicLabel color="var(--ink-faint)">
            no. {piece.n} · {DROP.name}
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
          {piece.note && (
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
          )}
        </div>

        {(piece.glaze || piece.dim) && (
          <div style={{ padding: "36px 28px 0" }}>
            <CeramicLabel color="var(--ink-faint)">
              about this piece
            </CeramicLabel>
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
              {piece.dim && <li>{piece.dim}</li>}
            </ul>
          </div>
        )}

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

        <div style={{ padding: "28px 28px 0" }}>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontFamily: "var(--serif)",
              fontSize: 13,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink-faint)",
              lineHeight: 2,
            }}
          >
            <li>
              each piece is hand built — dimensions and capacity are
              approximate and may vary slightly.
            </li>
            <li>
              all sales are final. if your piece arrives damaged, reach out
              within 3 days of delivery with a photo.
            </li>
          </ul>
        </div>

        {morePieces.length > 0 && (
          <div style={{ padding: "40px 16px 0" }}>
            <div
              style={{
                paddingBottom: 16,
                borderBottom: "1px solid var(--rule-strong)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 20,
              }}
            >
              <CeramicLabel color="var(--ink)">more pieces</CeramicLabel>
              <Link href="/shop" style={{ textDecoration: "none" }}>
                <CeramicLabel color="var(--ink-soft)">
                  see all {allPieces.length} →
                </CeramicLabel>
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {morePieces.map((m) => (
                <Link
                  key={m.id}
                  href={`/shop/${m.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <figure style={{ margin: 0, position: "relative" }}>
                    <Badge state={m.state} compact />
                    <Photo
                      ratio="4 / 5"
                      src={m.srcs[0]}
                      sizes="(max-width: 1023px) 50vw, 1px"
                      style={{ opacity: m.state === "gone" ? 0.5 : 1 }}
                    />
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: 13,
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
                          fontSize: 12,
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
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div
          style={{
            padding: "20px 56px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Link href="/shop" style={{ textDecoration: "none" }}>
            <CeramicLabel color="var(--ink-soft)">← {DROP.name}</CeramicLabel>
          </Link>
          <CeramicLabel color="var(--ink-faint)">
            no. {piece.n} · piece {pieceIndex + 1} of {allPieces.length}
          </CeramicLabel>
        </div>

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
            <ImageGallery srcs={piece.srcs} ratio="4 / 5" />
          </div>

          <div style={{ paddingTop: 24 }}>
            <CeramicLabel color="var(--ink-faint)">
              no. {piece.n} · {DROP.name}
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
            {piece.note && (
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
            )}

            {(piece.glaze || piece.dim) && (
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
                  {piece.dim && <li>{piece.dim}</li>}
                </ul>
              </div>
            )}

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

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "24px 0 0",
                fontFamily: "var(--serif)",
                fontSize: 13,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--ink-faint)",
                lineHeight: 2,
              }}
            >
              <li>
                each piece is hand built — dimensions and capacity are
                approximate and may vary slightly.
              </li>
              <li>
                all sales are final. if your piece arrives damaged, reach out
                within 3 days of delivery with a photo.
              </li>
            </ul>
          </div>
        </div>

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
                more from {DROP.name}
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
                        src={m.srcs[0]}
                        sizes="(min-width: 1024px) 22vw, 1px"
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
      </div>
    </div>
  );
}
