import Link from "next/link";
import { Photo } from "@/ui/Photo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Sig } from "@/ui/Sig";
import { PLACEHOLDER_PIECES } from "@/lib/placeholder-pieces";
import { DROP } from "@/lib/config";

const drop = PLACEHOLDER_PIECES;

export default function HomePage() {
  return (
    <div style={{ color: "var(--ink)", fontFamily: "var(--serif)" }}>
      {/* ── MOBILE ─────────────────────────────────────────────────── */}
      <div className="lg:hidden">
        {/* hero */}
        <div style={{ padding: "8px 16px 0" }}>
          <Photo ratio="5 / 4" src="/assets/hero-square.png" />
          <div style={{ paddingTop: 18, textAlign: "center" }}>
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: 16,
                fontWeight: 300,
                letterSpacing: "0.6em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              {DROP.name}
            </span>
            <div
              style={{
                marginTop: 14,
                fontFamily: "var(--serif)",
                fontSize: 19,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--ink-soft)",
                lineHeight: 1.3,
              }}
            >
              {DROP.subtitle}
            </div>
          </div>
        </div>

        {/* scatter — 3 images, compact stagger */}
        <div style={{ padding: "40px 20px 0" }}>
          {[
            { src: drop[0].src, w: 64, ratio: "3 / 4", align: "left", mt: 0 },
            {
              src: drop[2].src,
              w: 50,
              ratio: "1 / 1",
              align: "right",
              mt: -48,
            },
            { src: drop[5].src, w: 72, ratio: "4 / 5", align: "left", mt: 32 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                marginTop: s.mt,
                width: `${s.w}%`,
                marginLeft: s.align === "right" ? "auto" : 0,
                marginRight: s.align === "left" ? "auto" : 0,
              }}
            >
              <Photo ratio={s.ratio} src={s.src} />
            </div>
          ))}
        </div>

        {/* quote */}
        <div style={{ padding: "56px 36px 0", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 22,
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.45,
              color: "var(--ink)",
              margin: 0,
              letterSpacing: "-0.005em",
            }}
          >
            I make them slowly,
            <br />
            one at a time,
            <br />
            and put them here
            <br />
            as they come out of the kiln.
          </p>
          <Sig
            size={32}
            color="var(--ink)"
            style={{ marginTop: 22, display: "inline-block" }}
          >
            — alicia
          </Sig>
        </div>

        <div style={{ padding: "56px 24px 0", textAlign: "center" }}>
          <Link href="/shop" className="ds-action">
            enter the shop
          </Link>
        </div>
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {/* hero */}
        <div style={{ padding: "20px 56px 0", position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Photo ratio="16 / 9" src="/assets/banner.png" />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: "8%",
                textAlign: "center",
                textShadow: "0 2px 24px rgba(0,0,0,0.35)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 28,
                  fontWeight: 300,
                  letterSpacing: "0.6em",
                  textTransform: "uppercase",
                  color: "var(--paper)",
                }}
              >
                {DROP.name}
              </span>
              <div
                style={{
                  marginTop: 18,
                  fontFamily: "var(--serif)",
                  fontSize: 20,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "var(--paper)",
                  letterSpacing: "-0.005em",
                  opacity: 0.92,
                }}
              >
                {DROP.description}
              </div>
            </div>
          </div>
        </div>

        {/* meta row */}
        <div
          style={{
            padding: "36px 56px 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "baseline",
            gap: 32,
          }}
        >
          <CeramicLabel color="var(--ink-faint)">
            a new drop · {DROP.date}
          </CeramicLabel>
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: 17,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--ink-soft)",
              }}
            >
              {DROP.subtitle}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <Link href="/shop" className="ds-action">
              see the collection →
            </Link>
          </div>
        </div>

        {/* desktop scatter — 4 images, reduced height so text stays visible */}
        <div
          style={{
            position: "relative",
            height: 680,
            margin: "64px 56px 0",
          }}
        >
          {[
            { src: drop[0].src, left: "0%", top: 0, w: "30%", ratio: "3 / 4" },
            {
              src: drop[2].src,
              left: "38%",
              top: 80,
              w: "24%",
              ratio: "1 / 1",
            },
            {
              src: drop[5].src,
              left: "68%",
              top: 20,
              w: "20%",
              ratio: "3 / 4",
            },
            {
              src: drop[3].src,
              left: "18%",
              top: 320,
              w: "22%",
              ratio: "3 / 4",
            },
          ].map((p, i) => (
            <Link
              key={i}
              href={`/shop/${drop[i].id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  position: "absolute",
                  left: p.left,
                  top: p.top,
                  width: p.w,
                }}
              >
                <Photo ratio={p.ratio} src={p.src} />
              </div>
            </Link>
          ))}
        </div>

        {/* quote */}
        <div style={{ padding: "80px 56px 0", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 48,
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.15,
              color: "var(--ink)",
              margin: 0,
              letterSpacing: "-0.015em",
              maxWidth: 860,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            I make them slowly, one at a time,
            <br />
            and put them here as they come out of the kiln.
          </p>
          <Sig
            size={42}
            color="var(--ink)"
            style={{ marginTop: 32, display: "inline-block" }}
          >
            — alicia
          </Sig>
        </div>

        <div style={{ padding: "80px 56px 0", textAlign: "center" }}>
          <Link
            href="/shop"
            className="ds-action"
            style={{ fontSize: 13, paddingBottom: 8 }}
          >
            enter the shop
          </Link>
        </div>
      </div>
    </div>
  );
}
