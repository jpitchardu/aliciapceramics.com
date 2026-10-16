import Image from "next/image";
import { cookies } from "next/headers";
import { DROP, BYPASS_COOKIE, SHOP_CLOSED } from "@/lib/config";
import { isGateOpen } from "@/lib/countdown";
import {
  datesLabel,
  featuredClass,
  first,
  fromPrice,
  hasUpgrades,
  isMulti,
  money,
  timeLabel,
  whenLabel,
  type ClassEvent,
} from "@/lib/classes";
import { getClasses } from "@/lib/classes-square";
import { Countdown } from "@/ui/Countdown";
import { ShopClosed } from "@/ui/ShopClosed";
import {
  FillLink,
  Label,
  QuietLink,
  SeatsNote,
} from "@/app/(orders)/classes/_components/bits";

/*
 * Classes first: one photograph of a class, full-bleed, with the next class
 * a newcomer can book laid over it on a paper card (desktop) or set beneath
 * it (phones). The card is opaque paper, so the type reads on any part of
 * the photo — no scrim, no gradient.
 *
 * The photo is cropped to the bottom half of the original. Its focus sits on
 * her hands painting the mug, so object-position is tuned to keep them near
 * the middle of the frame at every width — not the table, not her face.
 */
const CLASS_PHOTO = "/assets/class-glazing.jpg"; // 1072 × 800
const PHOTO_ALT = "a student painting her mug at the studio table";
const PHOTO_FOCUS = "42% 38%";

// seats change as people book — always read fresh
export const dynamic = "force-dynamic";

const priceLabel = (e: ClassEvent) =>
  `${hasUpgrades(e) ? "from " : ""}${money(fromPrice(e))}`;
const dateLabel = (e: ClassEvent) =>
  isMulti(e) ? datesLabel(e) : whenLabel(first(e));

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

  const e = featuredClass(await getClasses());

  return (
    <div
      style={{
        color: "var(--ink)",
        fontFamily: "var(--serif)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
         * This page is one locked screen, so the footer sits right under the
         * photo (desktop) or the class details (phones) — its usual breathing
         * room would read as dead space. Whatever we take off the footer, the
         * photo gains. The bottom pad never drops below the home-indicator
         * inset.
         */
        body {
          --sf-footer-gap: 0px;
          --sf-footer-pad-bottom: 30px;
        }
        @media (max-width: 1023px) {
          body {
            --sf-footer-pad-top: 12px;
            --sf-footer-pad-bottom: max(18px, env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>

      <h1 className="sr-only">alicia p. ceramics</h1>

      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Image
          src={CLASS_PHOTO}
          alt={PHOTO_ALT}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: PHOTO_FOCUS }}
        />

        {/* ── DESKTOP: the card, on the wall right of her ─────────── */}
        <div
          className="hidden lg:block"
          style={{
            position: "absolute",
            top: 32,
            right: 56,
            width: 440,
            textAlign: "right",
            background: "var(--paper)",
            padding: "26px 30px",
          }}
        >
          {e ? <DesktopCard e={e} /> : <NoDatesCard />}
        </div>
      </div>

      {/* ── MOBILE: the details, under the photo ───────────────────── */}
      <div className="lg:hidden">
        {e ? <MobileDetails e={e} /> : <NoDatesMobile />}
      </div>
    </div>
  );
}

function DesktopCard({ e }: { e: ClassEvent }) {
  return (
    <>
      <Label color="var(--ink)">next at the studio · {e.kind}</Label>
      <h2
        style={{
          margin: "12px 0 0",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          lineHeight: 1.25,
        }}
      >
        {e.title}
      </h2>
      <div style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5 }}>
        {dateLabel(e)} · {timeLabel(e)} · {priceLabel(e)}
      </div>
      <div style={{ marginTop: 6 }}>
        <SeatsNote e={e} />
      </div>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 26,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <QuietLink href="/classes">every class →</QuietLink>
        <FillLink
          href={`/classes/${e.id}`}
          style={{ padding: "14px 24px", fontSize: 11 }}
        >
          book a seat<span className="sr-only"> — {e.title}</span>
        </FillLink>
      </div>
    </>
  );
}

function MobileDetails({ e }: { e: ClassEvent }) {
  return (
    <>
      <div style={{ padding: "24px 24px 0", textAlign: "center" }}>
        <Label color="var(--ink)">next at the studio</Label>
        <h2
          style={{
            margin: "10px 0 0",
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.3,
          }}
        >
          {e.title}
        </h2>
        <div style={{ marginTop: 8, fontSize: 14 }}>
          {dateLabel(e)} · {timeLabel(e)}
        </div>
        <div style={{ marginTop: 4 }}>
          <SeatsNote e={e} />
        </div>
        <div style={{ marginTop: 18 }}>
          <QuietLink href={`/classes/${e.id}`}>
            book a seat · {priceLabel(e)}
            <span className="sr-only"> — {e.title}</span>
          </QuietLink>
        </div>
      </div>
      <MobileMore more="more dates →" />
    </>
  );
}

/* between seasons: nothing to book yet, so point at the classes page */
function NoDatesCard() {
  return (
    <>
      <Label color="var(--ink)">classes at the studio</Label>
      <h2
        style={{
          margin: "12px 0 0",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          lineHeight: 1.25,
        }}
      >
        new dates soon
      </h2>
      <div style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5 }}>
        they show up first on instagram.
      </div>
      <div style={{ marginTop: 20 }}>
        <QuietLink href="/classes">every class →</QuietLink>
      </div>
    </>
  );
}

function NoDatesMobile() {
  return (
    <>
      <div style={{ padding: "24px 24px 0", textAlign: "center" }}>
        <Label color="var(--ink)">classes at the studio</Label>
        <h2
          style={{
            margin: "10px 0 0",
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.3,
          }}
        >
          new dates soon
        </h2>
      </div>
      <MobileMore more="every class →" />
    </>
  );
}

function MobileMore({ more }: { more: string }) {
  return (
    <div
      style={{
        padding: "22px 24px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
      }}
    >
      <QuietLink
        href="/classes"
        color="var(--ink-soft)"
        style={{ borderBottom: "none" }}
      >
        {more}
      </QuietLink>
      <QuietLink
        href="/shop"
        color="var(--ink-soft)"
        style={{ borderBottom: "none" }}
      >
        the shop →
      </QuietLink>
    </div>
  );
}
