import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Photo } from "@/ui/Photo";
import {
  STUDIO,
  first,
  hasChoice,
  money,
  isMulti,
  isSoldOut,
  nextOpen,
  seatNote,
  shortDay,
  timeLabel,
  weekdayOf,
  whenLabel,
  type ClassEvent,
} from "@/lib/classes";
import {
  BackLink,
  CollabMark,
  DateBlock,
  EventBadge,
  Facts,
  Label,
  QuietLink,
  TextLink,
} from "../_components/bits";
import { BookPanel, WaitList } from "../_components/forms";
import { getClass, getClasses } from "@/lib/classes-square";

// seats change as people book — always read fresh
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const e = await getClass((await params).id);
  return { title: e ? `${e.title} — classes — alicia p. ceramics` : undefined };
}

/*
 * One ticketed event: a plain evening, a two-session class (the schedule
 * spelled out), a collaboration (who brings what), or sold out (wait-list).
 */
export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = await getClasses();
  const e = all.find((c) => c.id === id);
  if (!e) notFound();
  const out = isSoldOut(e);

  return (
    <div className="cl-wrap">
      <BackLink />
      <div
        style={{
          marginTop: 22,
          borderTop: "1px solid var(--rule-strong)",
          paddingTop: 26,
        }}
      >
        <Mast e={e} />
      </div>

      <div className="cl-detail" style={{ marginTop: 34 }}>
        <div>
          <Photo
            src={e.photo}
            ratio="4 / 3"
            sizes="(min-width: 1024px) 560px, 100vw"
            style={out ? { filter: "saturate(0.55)", opacity: 0.8 } : undefined}
          />
          <p
            className="cl-blurb"
            style={{
              margin: "24px 0 0",
              lineHeight: 1.65,
              color: "var(--ink-soft)",
            }}
          >
            {e.blurb}
          </p>
          {isMulti(e) && <TwoSessions e={e} />}
          {e.collab && (e.collab.brings || e.collab.note) && (
            <WhoBringsWhat e={e} />
          )}
          <Facts
            style={{
              marginTop: 28,
              borderTop: "1px solid var(--rule-soft)",
              paddingTop: 10,
            }}
            rows={[
              ["when", <When key="when" e={e} />],
              ...(hasChoice(e)
                ? ([
                    [
                      "pick your piece",
                      e.pieces
                        .map(
                          (p) =>
                            `${p.name}${p.extra > 0 ? ` (+${money(p.extra)})` : ""}`,
                        )
                        .join(" · "),
                    ],
                  ] as [string, string][])
                : []),
              ...(e.make
                ? [["you'll leave with", e.make] as [string, string]]
                : []),
              ...(e.duration
                ? [["how long", e.duration] as [string, string]]
                : []),
              ["where", STUDIO],
              ...(e.facts ?? []),
            ]}
          />
        </div>

        <div className="cl-sticky">
          {out ? (
            <>
              <WaitList e={e} />
              <NextOne e={e} all={all} />
            </>
          ) : (
            <>
              <BookPanel e={e} />
              <p
                style={{
                  margin: "18px 0 0",
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  lineHeight: 1.6,
                }}
              >
                {e.aside ?? (
                  <>
                    can&apos;t make this one?{" "}
                    <TextLink href="/classes/private">
                      book the studio privately
                    </TextLink>{" "}
                    and pick your own date.
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Mast({ e }: { e: ClassEvent }) {
  const out = isSoldOut(e);
  return (
    <div className={`cl-mast${isMulti(e) ? " cl-mast--multi" : ""}`}>
      <DateBlock e={e} dim={out} />
      <div style={{ minWidth: 0 }}>
        {e.collab && (
          <div
            style={{
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: "1px solid var(--rule-soft)",
            }}
          >
            <CollabMark e={e} />
            <div
              style={{ marginTop: 8, fontSize: 14, color: "var(--ink-soft)" }}
            >
              {[
                e.collab.trade && `with ${e.collab.trade}`,
                e.collab.handle && `@${e.collab.handle}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px 16px",
            flexWrap: "wrap",
          }}
        >
          <h1
            className="cl-mast-title"
            style={{
              margin: 0,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.04,
              color: out ? "var(--ink-soft)" : "var(--ink)",
            }}
          >
            {e.title}
          </h1>
          {out ? (
            <EventBadge quiet>sold out</EventBadge>
          ) : isMulti(e) ? (
            <EventBadge>two sessions</EventBadge>
          ) : e.collab ? (
            <EventBadge>a collaboration</EventBadge>
          ) : null}
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: "6px 18px",
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          {e.kind && <Label color="var(--ink-soft)">{e.kind}</Label>}
          <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
            {(isMulti(e)
              ? [e.duration]
              : [whenLabel(first(e)), timeLabel(e), e.duration]
            )
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      </div>
    </div>
  );
}

const When = ({ e }: { e: ClassEvent }) => (
  <>
    {e.sessions.map((s, i) => (
      <span key={s.date} style={{ display: "block" }}>
        {whenLabel(s)} · {s.time}
        {i === 0 && isMulti(e) ? " and" : ""}
      </span>
    ))}
  </>
);

/* the two sessions, spelled out — the schedule has to earn itself */
function TwoSessions({ e }: { e: ClassEvent }) {
  return (
    <section
      aria-label="the two sessions"
      style={{
        marginTop: 30,
        border: "1px solid var(--rule-strong)",
        padding: "22px 22px 24px",
      }}
    >
      <Label color="var(--ink)">the two sessions</Label>
      <ol style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
        {e.sessions.map((s, i) => (
          <li
            key={s.date}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "4px 22px",
              alignItems: "baseline",
              padding: "16px 0",
              borderTop: i === 0 ? "none" : "1px dashed var(--rule-strong)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <Label>{i === 0 ? "first" : "then"}</Label>
              <span style={{ fontSize: 22, whiteSpace: "nowrap" }}>
                {shortDay(s.date)}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 17 }}>{s.note}</div>
              <div
                style={{ marginTop: 4, fontSize: 13, color: "var(--ink-soft)" }}
              >
                {weekdayOf(s.date)} · {s.time}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p
        style={{
          margin: "14px 0 0",
          paddingTop: 14,
          borderTop: "1px solid var(--rule-soft)",
          fontSize: 14,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
        }}
      >
        the gap isn&apos;t padding — thrown clay has to firm up to leather-hard
        before it can be trimmed. a week is about right.
      </p>
    </section>
  );
}

/* who brings what — the honest split of a joint event */
function WhoBringsWhat({ e }: { e: ClassEvent }) {
  const c = e.collab!;
  return (
    <section
      aria-label="who brings what"
      style={{
        marginTop: 30,
        border: "1px solid var(--rule-strong)",
        background: "var(--paper-2)",
        padding: "22px 22px 24px",
      }}
    >
      <Label color="var(--ink)">
        {c.brings ? "who brings what" : `with ${c.with}`}
      </Label>
      {c.brings && (
        <div className="cl-split" style={{ marginTop: 18 }}>
          <div>
            <Label>aliciapceramics</Label>
            <div style={{ marginTop: 8, fontSize: 17, lineHeight: 1.5 }}>
              {c.aliciaBrings}
            </div>
          </div>
          <span
            aria-hidden
            style={{
              fontSize: 24,
              color: "var(--ink-faint)",
              alignSelf: "center",
              textAlign: "center",
            }}
          >
            ×
          </span>
          <div>
            <Label>{c.with}</Label>
            <div style={{ marginTop: 8, fontSize: 17, lineHeight: 1.5 }}>
              {c.brings}
            </div>
          </div>
        </div>
      )}
      {c.note && (
        <p
          style={{
            margin: "18px 0 0",
            paddingTop: 14,
            borderTop: c.brings ? "1px solid var(--rule-soft)" : "none",
            fontSize: 14,
            color: "var(--ink-soft)",
            lineHeight: 1.6,
          }}
        >
          {c.note}
        </p>
      )}
    </section>
  );
}

/* sold out: point at the next open one */
function NextOne({ e, all }: { e: ClassEvent; all: ClassEvent[] }) {
  const next = nextOpen(e, all);
  if (!next) return null;
  return (
    <div
      style={{
        marginTop: 24,
        borderTop: "1px solid var(--rule-soft)",
        paddingTop: 18,
      }}
    >
      <Label>the next one with seats</Label>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 19 }}>{next.title}</div>
          <div style={{ marginTop: 5, fontSize: 13, color: "var(--ink-soft)" }}>
            {whenLabel(first(next))} · {seatNote(next)}
          </div>
        </div>
        <QuietLink href={`/classes/${next.id}`}>
          see it<span className="sr-only"> — {next.title}</span> →
        </QuietLink>
      </div>
    </div>
  );
}
