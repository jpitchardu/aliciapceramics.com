import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { DROP, BYPASS_COOKIE, SHOP_CLOSED } from "@/lib/config";
import { isGateOpen } from "@/lib/countdown";
import { Countdown } from "@/ui/Countdown";
import { ShopClosed } from "@/ui/ShopClosed";

/*
 * Two crops of the same studio photograph, cut so the pots fill the frame and
 * a band of plain wall is left for the headline to sit on — top-right on the
 * landscape crop, across the top on the portrait one. That wall band is what
 * makes the type legible, so the headline must not be moved off it: no scrim,
 * no gradient, no tinted type.
 */
const HERO_DESKTOP = "/assets/hero-desktop.jpg"; // 2880 × 1390
const HERO_MOBILE = "/assets/hero-mobile.jpg"; // 1800 × 2100

export default async function HomePage() {
  const bypassed = (await cookies()).get(BYPASS_COOKIE)?.value === "1";
  const isOpen = isGateOpen(DROP.opensAt);

  if (SHOP_CLOSED && !bypassed) {
    return <ShopClosed />;
  }

  if (!isOpen && !bypassed) {
    return (
      <Countdown
        opensAt={DROP.opensAt}
        dropName="alicia p ceramics"
        dropSubtitle={DROP.description}
      />
    );
  }

  return (
    <div
      style={{
        color: "var(--ink)",
        fontFamily: "var(--serif)",
        height: "100%",
      }}
    >
      {/*
       * Make the full page (nav + main + footer) a flex column capped at
       * 100dvh with no scroll. Scoped to this page — removed on navigation.
       */}
      <style>{`
        html { height: 100dvh; overflow: hidden; }
        body { height: 100%; display: flex; flex-direction: column; }
        body > header { flex-shrink: 0; }
        body > main  { flex: 1; min-height: 0; overflow: hidden; }
        body > footer { flex-shrink: 0; }

        /*
         * On phones this page is one locked screen, so the footer's usual
         * breathing room reads as dead space under the photo rather than as
         * rhythm. Tighten it here only — scrolling pages keep the roomy
         * footer. Whatever we take off the footer, the hero gains.
         * The bottom pad never drops below the home-indicator inset.
         */
        @media (max-width: 1023px) {
          body {
            --sf-footer-gap: 14px;
            --sf-footer-pad-top: 12px;
            --sf-footer-pad-bottom: max(18px, env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>

      <h1 className="sr-only">alicia p. ceramics</h1>

      {/* ── MOBILE ─────────────────────────────────────────────────── */}
      <div
        className="lg:hidden"
        style={{ position: "relative", height: "100%", overflow: "hidden" }}
      >
        <Image
          src={HERO_MOBILE}
          alt=""
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 1px"
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />

        {/* headline sits on the band of wall across the top of the crop */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 22,
            padding: "0 22px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.3,
              color: "var(--ink)",
            }}
          >
            {DROP.description}
          </div>
          <div style={{ marginTop: 18 }}>
            <Link href="/shop" className="ds-action">
              enter the shop
            </Link>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────── */}
      <div
        className="hidden lg:block"
        style={{ position: "relative", height: "100%", overflow: "hidden" }}
      >
        <Image
          src={HERO_DESKTOP}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 100vw, 1px"
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />

        {/* headline sits in the quiet wall corner of the photo — no overlay */}
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 56,
            width: 420,
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              lineHeight: 1.25,
              color: "var(--ink)",
            }}
          >
            {DROP.description}
          </div>
          <div style={{ marginTop: 14 }}>
            <Link
              href="/shop"
              className="ds-action"
              style={{ fontSize: 13, fontWeight: 700 }}
            >
              see the collection →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
