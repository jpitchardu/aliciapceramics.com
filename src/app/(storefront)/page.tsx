import Link from "next/link";
import { cookies } from "next/headers";
import { Photo } from "@/ui/Photo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { DROP, MEDIA_BASE_URL, BYPASS_COOKIE } from "@/lib/config";
import { isGateOpen } from "@/lib/countdown";
import { Countdown } from "@/ui/Countdown";

const HERO = `${MEDIA_BASE_URL}/hero-2.jpg`;

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
      <div
        className="lg:hidden"
        style={{ position: "relative", height: "100dvh" }}
      >
        <Photo
          src={HERO}
          objectFit="contain"
          objectPosition="bottom center"
          sizes="(max-width: 1023px) 100vw, 1px"
          style={{ height: "100dvh", aspectRatio: "unset" }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "8%",
            textAlign: "center",
          }}
        >
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
              color: "var(--ink)",
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
      <div
        className="hidden lg:block"
        style={{ position: "relative", height: "100dvh" }}
      >
        <Photo
          src={HERO}
          sizes="(min-width: 1024px) 100vw, 1px"
          style={{ height: "100dvh", aspectRatio: "unset" }}
        />

        {/* drop name + description */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "18%",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 28,
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
              marginTop: 18,
              fontFamily: "var(--serif)",
              fontSize: 20,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink)",
              letterSpacing: "-0.005em",
              opacity: 0.92,
            }}
          >
            {DROP.description}
          </div>
        </div>

        {/* meta row — pinned to bottom */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "0 56px 36px",
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
      </div>
    </div>
  );
}
