import Link from "next/link";
import { Suspense } from "react";
import { Photo } from "@/ui/Photo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Badge } from "@/ui/Badge";
import { DROP } from "@/lib/config";
import { fetchCatalog } from "@/lib/square";
import { ShopFilters } from "./_components/ShopFilters";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const { pieces, categories } = await fetchCatalog();

  const filtered =
    cat && cat !== "all"
      ? pieces.filter((p) => p.collections.includes(cat))
      : pieces;

  const hereCount = filtered.filter((p) => p.state === "here").length;
  const goneCount = filtered.filter((p) => p.state === "gone").length;

  return (
    <div style={{ color: "var(--ink)", fontFamily: "var(--serif)" }}>
      {/* ── MOBILE ─────────────────────────────────────────────────── */}
      <div className="lg:hidden">
        <div
          style={{
            padding: "8px 24px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <CeramicLabel color="var(--ink-faint)">
            {DROP.name} · {filtered.length} pieces
          </CeramicLabel>
          <CeramicLabel color="var(--ink-faint)">tap a piece</CeramicLabel>
        </div>

        <Suspense>
          <ShopFilters categories={categories} />
        </Suspense>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            padding: "0 16px",
          }}
        >
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.id}`}
              style={{ textDecoration: "none" }}
            >
              <figure style={{ margin: 0, position: "relative", cursor: "pointer" }}>
                <Badge state={p.state} compact />
                <Photo
                  ratio="4 / 5"
                  src={p.srcs[0]}
                  sizes="(max-width: 1023px) 50vw, 1px"
                  style={{ opacity: p.state === "gone" ? 0.5 : 1 }}
                />
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 12,
                      fontStyle: "italic",
                      fontWeight: 300,
                      color: p.state === "gone" ? "var(--ink-faint)" : "var(--ink)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.title}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 12,
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
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div style={{ padding: "64px 56px 0", textAlign: "center" }}>
          <CeramicLabel color="var(--ink-faint)">
            a new drop · {DROP.date}
          </CeramicLabel>
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
              {DROP.name}
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
            made of earth, full of His spirit — {pieces.length} new pieces,
            revelations of creation.
          </p>
        </div>

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
          <Suspense>
            <ShopFilters categories={categories} />
          </Suspense>
          <CeramicLabel color="var(--ink-faint)">
            {hereCount} still here · {goneCount} taken
          </CeramicLabel>
        </div>

        <div
          style={{
            padding: "40px 56px 0",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 48,
          }}
        >
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.id}`}
              style={{ textDecoration: "none" }}
            >
              <figure style={{ margin: 0, cursor: "pointer" }}>
                <div style={{ position: "relative" }}>
                  <Badge state={p.state} />
                  <Photo
                    ratio="4 / 5"
                    src={p.srcs[0]}
                    sizes="(min-width: 1024px) 30vw, 1px"
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
                        color:
                          p.state === "gone"
                            ? "var(--ink-faint)"
                            : "var(--ink)",
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.title}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <CeramicLabel
                        color="var(--ink-faint)"
                        style={{ fontSize: 9 }}
                      >
                        no. {p.n}
                      </CeramicLabel>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 15,
                      fontWeight: 300,
                      color:
                        p.state === "gone" ? "var(--ink-faint)" : "var(--ink)",
                      textDecoration:
                        p.state === "gone" ? "line-through" : "none",
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

        <div style={{ padding: "80px 56px 0", textAlign: "center" }}>
          <CeramicLabel color="var(--ink-faint)">
            end of drop · {DROP.name} · {DROP.date}
          </CeramicLabel>
        </div>
      </div>
    </div>
  );
}
