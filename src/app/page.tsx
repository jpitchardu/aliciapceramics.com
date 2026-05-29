import Link from "next/link";
import { Logo } from "@/ui/Logo";
import { Photo } from "@/ui/Photo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Sig } from "@/ui/Sig";
import { StorefrontFooter } from "@/ui/storefront/StorefrontFooter";
import { DesktopNav } from "@/ui/storefront/DesktopNav";
import { PLACEHOLDER_PIECES } from "@/lib/placeholder-pieces";

const drop = PLACEHOLDER_PIECES;

export default function HomePage() {
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
        {/* mobile nav */}
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
          <Link
            href="/shop?collection=archive"
            style={{ textDecoration: "none", justifySelf: "end" }}
          >
            <CeramicLabel color="var(--ink-soft)">archive</CeramicLabel>
          </Link>
        </div>

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
              creating spring
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
              the warm rooms of a slow morning.
            </div>
          </div>
        </div>

        {/* scatter */}
        <div style={{ padding: "64px 20px 0", position: "relative" }}>
          {[
            { src: drop[0].src, w: 62, ratio: "3 / 4", align: "left", mt: 0 },
            {
              src: drop[2].src,
              w: 48,
              ratio: "1 / 1",
              align: "right",
              mt: -72,
            },
            { src: drop[5].src, w: 84, ratio: "4 / 5", align: "left", mt: 84 },
            { src: drop[3].src, w: 42, ratio: "3 / 4", align: "left", mt: 48 },
            {
              src: drop[7].src,
              w: 50,
              ratio: "1 / 1",
              align: "right",
              mt: -110,
            },
            { src: drop[8].src, w: 72, ratio: "4 / 5", align: "right", mt: 72 },
            { src: drop[10].src, w: 56, ratio: "3 / 4", align: "left", mt: 56 },
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
        <div style={{ padding: "88px 36px 0", textAlign: "center" }}>
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

        {/* enter the shop */}
        <div style={{ padding: "80px 24px 0", textAlign: "center" }}>
          <Link href="/shop" className="ds-action">
            enter the shop
          </Link>
        </div>

        <StorefrontFooter pad={28} topGap={100} />
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <DesktopNav />

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
                color: "var(--paper)",
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
                creating spring
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
                made of earth, full of His spirit.
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
            a new drop · jun 2026
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
              the warm rooms of a slow morning.
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <Link href="/shop" className="ds-action">
              see the collection →
            </Link>
          </div>
        </div>

        {/* desktop scatter */}
        <div
          style={{
            position: "relative",
            height: 1400,
            margin: "80px 56px 0",
            cursor: "pointer",
          }}
        >
          {[
            { src: drop[0].src, left: "0%", top: 0, w: "32%", ratio: "3 / 4" },
            {
              src: drop[2].src,
              left: "44%",
              top: 120,
              w: "26%",
              ratio: "1 / 1",
            },
            {
              src: drop[5].src,
              left: "76%",
              top: 40,
              w: "22%",
              ratio: "3 / 4",
            },
            {
              src: drop[3].src,
              left: "20%",
              top: 620,
              w: "20%",
              ratio: "3 / 4",
            },
            {
              src: drop[7].src,
              left: "48%",
              top: 580,
              w: "28%",
              ratio: "1 / 1",
            },
            {
              src: drop[8].src,
              left: "4%",
              top: 920,
              w: "24%",
              ratio: "3 / 4",
            },
            {
              src: drop[10].src,
              left: "62%",
              top: 880,
              w: "32%",
              ratio: "4 / 5",
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
        <div style={{ padding: "120px 56px 0", textAlign: "center" }}>
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

        {/* enter the shop */}
        <div style={{ padding: "120px 56px 0", textAlign: "center" }}>
          <Link
            href="/shop"
            className="ds-action"
            style={{ fontSize: 13, paddingBottom: 8 }}
          >
            enter the shop
          </Link>
        </div>

        <StorefrontFooter />
      </div>
    </div>
  );
}
