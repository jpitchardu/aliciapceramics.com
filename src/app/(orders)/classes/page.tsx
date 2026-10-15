import { Photo } from "@/ui/Photo";
import { Sig } from "@/ui/Sig";
import {
  PRIVATE,
  datesLabel,
  fromPrice,
  hasUpgrades,
  isMulti,
  isSoldOut,
  money,
  timeLabel,
  whenLabel,
  first,
  type ClassEvent,
} from "@/lib/classes";
import { getClasses } from "@/lib/classes-square";
import {
  CollabMark,
  DateBlock,
  EventBadge,
  FollowInstagram,
  FillLink,
  Label,
  QuietLink,
  SeatsNote,
} from "./_components/bits";

/*
 * The landing: upcoming dated classes, soonest first, with the private
 * invitation at the foot. `?preview=empty` shows the quiet month.
 */
// seats change as people book — always read fresh
export const dynamic = "force-dynamic";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const events = preview === "empty" ? [] : await getClasses();

  return (
    <div className="cl-wrap">
      {events.length ? (
        <>
          <div className="cl-head" style={{ paddingTop: 10 }}>
            <Label>what&apos;s on at the studio</Label>
            <h1
              className="cl-head-title"
              style={{
                margin: "14px 0 0",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              come and make something.
            </h1>
            <p
              className="cl-head-sub"
              style={{
                margin: "16px 0 0",
                fontSize: 17,
                color: "var(--ink-soft)",
                lineHeight: 1.55,
                maxWidth: 470,
              }}
            >
              a few evenings and mornings each month, six or eight seats apiece.
              book one and it&apos;s yours.
            </p>
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: "40px 0 0",
              padding: 0,
              borderBottom: "1px solid var(--rule-soft)",
            }}
          >
            {events.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </ul>
        </>
      ) : (
        <QuietMonth />
      )}
      <PrivateInvite />
    </div>
  );
}

function EventRow({ e }: { e: ClassEvent }) {
  const out = isSoldOut(e);
  const joint = !!e.collab;
  const href = `/classes/${e.id}`;
  return (
    <li
      className={`cl-row${joint ? " cl-row--joint" : ""}${isMulti(e) ? " cl-row--multi" : ""}`}
      style={{
        borderTop: "1px solid var(--rule-soft)",
        background: joint ? "var(--paper-2)" : "transparent",
        boxShadow: joint
          ? "inset 1px 0 0 var(--rule-strong), inset -1px 0 0 var(--rule-strong)"
          : "none",
      }}
    >
      <div className="cl-row-date">
        <DateBlock e={e} dim={out} struck={out} />
      </div>
      <div className="cl-row-body" style={{ minWidth: 0 }}>
        {joint && (
          <div style={{ marginBottom: 8 }}>
            <CollabMark e={e} color="var(--ink-soft)" />
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "6px 14px",
            flexWrap: "wrap",
          }}
        >
          <h2
            className="cl-row-title"
            style={{
              margin: 0,
              fontWeight: 400,
              letterSpacing: "-0.015em",
              lineHeight: 1.15,
              color: out ? "var(--ink-soft)" : "var(--ink)",
            }}
          >
            {e.title}
          </h2>
          <span className="ws-desktop-only">
            <Label>{e.kind}</Label>
          </span>
          {isMulti(e) && <EventBadge>two sessions</EventBadge>}
        </div>
        <p
          className="ws-desktop-only"
          style={{
            margin: "9px 0 0",
            fontSize: 15,
            color: "var(--ink-soft)",
            lineHeight: 1.55,
            maxWidth: 460,
          }}
        >
          {e.make}
        </p>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: "4px 14px",
            alignItems: "baseline",
            flexWrap: "wrap",
            fontSize: 14,
            color: "var(--ink-soft)",
          }}
        >
          <span style={out ? { textDecoration: "line-through" } : undefined}>
            {isMulti(e)
              ? `${datesLabel(e)} · ${timeLabel(e)}`
              : `${whenLabel(first(e))} · ${timeLabel(e)}`}
          </span>
          <SeatsNote e={e} />
        </div>
      </div>
      <div className="cl-row-buy">
        <div className="cl-row-price">
          <span style={{ fontSize: 24 }}>
            {hasUpgrades(e) ? "from " : ""}
            {money(fromPrice(e))}
          </span>
          <Label>{isMulti(e) ? "both sessions" : "a seat"}</Label>
        </div>
        <div style={{ marginTop: 12 }}>
          {out ? (
            <QuietLink href={href} color="var(--ink-soft)">
              see the class
              <span className="sr-only"> — {e.title}</span>
            </QuietLink>
          ) : (
            <FillLink
              href={href}
              className="cl-row-cta"
              style={{ padding: "13px 22px", fontSize: 11 }}
            >
              book a seat
              <span className="sr-only"> — {e.title}</span>
            </FillLink>
          )}
        </div>
      </div>
    </li>
  );
}

function QuietMonth() {
  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: 560,
        margin: "0 auto",
        padding: "30px 0 8px",
      }}
    >
      <Label>what&apos;s on at the studio</Label>
      <h1
        className="cl-head-title"
        style={{
          margin: "14px 0 0",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.06,
        }}
      >
        nothing on the calendar just now.
      </h1>
      <p
        style={{
          margin: "18px auto 0",
          fontSize: 17,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
        }}
      >
        i&apos;m firing a big batch of orders this month, so the bench is full.
        new dates go up at the start of next month — or book the studio
        privately whenever suits you.
      </p>
      <FollowInstagram style={{ margin: "32px auto 0", maxWidth: 400 }}>
        new dates go up on instagram first — follow along for updates.
      </FollowInstagram>
      <Sig size={30} style={{ marginTop: 30 }}>
        — a.
      </Sig>
    </div>
  );
}

function PrivateInvite() {
  return (
    <section
      aria-labelledby="cl-private"
      style={{
        marginTop: 56,
        borderTop: "1px solid var(--rule-strong)",
        paddingTop: 32,
      }}
    >
      <div className="cl-invite">
        <div>
          <Label>or book privately</Label>
          <h2
            id="cl-private"
            style={{
              margin: "14px 0 0",
              fontSize: 32,
              fontWeight: 400,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
            }}
          >
            {PRIVATE.title}
          </h2>
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 16,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
              maxWidth: 420,
            }}
          >
            {PRIVATE.blurb}
          </p>
          <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6 }}>
            here at the studio, up to ten — or i&apos;ll bring the bench to you.
          </p>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <QuietLink href="/classes/private">request a date →</QuietLink>
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              {PRIVATE.minGuests}–{PRIVATE.maxGuests} people ·{" "}
              {PRIVATE.priceNote}
            </span>
          </div>
        </div>
        <div className="ws-desktop-only">
          <Photo
            src={PRIVATE.photo}
            ratio="16 / 10"
            sizes="(min-width: 1024px) 500px, 1px"
          />
        </div>
      </div>
    </section>
  );
}
