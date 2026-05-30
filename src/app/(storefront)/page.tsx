import Link from "next/link";
import { cookies } from "next/headers";
import { Photo } from "@/ui/Photo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { DROP, MEDIA_BASE_URL, BYPASS_COOKIE } from "@/lib/config";
import { isGateOpen } from "@/lib/countdown";
import { Countdown } from "@/ui/Countdown";

const HERO = `${MEDIA_BASE_URL}/hero-2.jpg`;
const EDITORIAL = Array.from(
  { length: 7 },
  (_, i) => `${MEDIA_BASE_URL}/editorial-${i + 1}.jpg`,
);

export default async function HomePage() {
  const bypassed = (await cookies()).get(BYPASS_COOKIE)?.value === "1";
  const isOpen = isGateOpen(DROP.opensAt);

  if (!isOpen && !bypassed) {
    return (
      <Countdown
        opensAt={DROP.opensAt}
        dropName={DROP.name}
        dropSubtitle={DROP.subtitle}
      />
    );
  }

  return (
    <div style={{ color: "var(--ink)", fontFamily: "var(--serif)" }}>
      <h1 className="sr-only">alicia p. ceramics — {DROP.name}</h1>
      {/* ── MOBILE ─────────────────────────────────────────────────── */}
      <div className="lg:hidden">
        <Photo
          ratio="5 / 4"
          src={HERO}
          rotate={90}
          sizes="(max-width: 1023px) 125vw, 1px"
        />
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
          <div style={{ marginTop: 28 }}>
            <Link href="/shop" className="ds-action">
              enter the shop
            </Link>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {/* hero — full width */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Photo
              ratio="3 / 2"
              src={HERO}
              sizes="(min-width: 1024px) 100vw, 1px"
            />
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

        {/* desktop scatter — 7 images, alternating z-index, funky layout */}
        <div
          style={{
            position: "relative",
            height: 860,
            margin: "64px 56px 0",
            overflow: "hidden",
          }}
        >
          {[
            {
              src: EDITORIAL[0],
              left: "2%",
              top: 0,
              w: "28%",
              ratio: "3 / 4",
              z: 2,
            },
            {
              src: EDITORIAL[1],
              left: "22%",
              top: 120,
              w: "18%",
              ratio: "4 / 5",
              z: 1,
            },
            {
              src: EDITORIAL[2],
              left: "44%",
              top: 20,
              w: "25%",
              ratio: "3 / 4",
              z: 2,
            },
            {
              src: EDITORIAL[3],
              left: "65%",
              top: 180,
              w: "20%",
              ratio: "1 / 1",
              z: 1,
            },
            {
              src: EDITORIAL[4],
              left: "10%",
              top: 430,
              w: "22%",
              ratio: "4 / 5",
              z: 2,
            },
            {
              src: EDITORIAL[5],
              left: "36%",
              top: 300,
              w: "28%",
              ratio: "3 / 4",
              z: 1,
            },
            {
              src: EDITORIAL[6],
              left: "68%",
              top: 480,
              w: "21%",
              ratio: "4 / 5",
              z: 2,
            },
          ].map((p, i) => (
            <Link
              key={i}
              href="/shop"
              aria-label="Enter the shop"
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  position: "absolute",
                  left: p.left,
                  zIndex: p.z,
                  top: p.top,
                  width: p.w,
                }}
              >
                <Photo
                  ratio={p.ratio}
                  src={p.src}
                  sizes={`(min-width: 1024px) ${parseInt(p.w)}vw, 1px`}
                />
              </div>
            </Link>
          ))}
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
