import { notFound, redirect } from "next/navigation";
import {
  clampSeats,
  findEvent,
  isMulti,
  isSoldOut,
  money,
  whenLabel,
} from "@/lib/classes";
import { BackLink, DateBlock, EventBadge, Label } from "../../_components/bits";
import { ContinueToSquare } from "../../_components/forms";

/* the handoff to square — stated out loud, with the order read back */
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ seats?: string }>;
}) {
  const e = findEvent((await params).id);
  if (!e) notFound();
  if (isSoldOut(e)) redirect(`/classes/${e.id}`);
  const n = clampSeats(e, (await searchParams).seats ?? 1);
  const seats = `${n} ${n === 1 ? "seat" : "seats"}`;

  return (
    <div
      className="cl-wrap"
      style={{ maxWidth: 620, textAlign: "center", paddingBottom: 10 }}
    >
      <Label>holding your {n === 1 ? "seat" : "seats"}</Label>
      <h1
        className="cl-title-xl"
        style={{
          margin: "16px 0 0",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
        }}
      >
        off to square to pay.
      </h1>
      <p
        style={{
          margin: "18px auto 0",
          maxWidth: 430,
          fontSize: 16,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
        }}
      >
        i keep the card side of things with square, so the last step happens
        there. your {n === 1 ? "seat is" : "seats are"} held for the next ten
        minutes.
      </p>

      <div
        style={{
          marginTop: 30,
          border: "1px solid var(--rule-strong)",
          background: "var(--paper-2)",
          padding: "22px 24px",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 400 }}>
              {e.title}
            </h2>
            {isMulti(e) && (
              <div style={{ marginTop: 8 }}>
                <EventBadge>two sessions</EventBadge>
              </div>
            )}
          </div>
          <DateBlock e={e} size="sm" />
        </div>
        <ul
          style={{
            listStyle: "none",
            margin: "16px 0 0",
            padding: "12px 0 0",
            borderTop: "1px dashed var(--rule-strong)",
          }}
        >
          {e.sessions.map((s) => (
            <li
              key={s.date}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "5px 0",
                fontSize: 14,
                color: "var(--ink-soft)",
              }}
            >
              <span>{whenLabel(s)}</span>
              <span>{s.time}</span>
            </li>
          ))}
        </ul>
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid var(--rule-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
            {n} × {money(e.price)}
            {isMulti(e) ? ", both sessions" : ""}
          </span>
          <span style={{ fontSize: 28, fontWeight: 700 }}>
            {money(e.price * n)}
          </span>
        </div>
        <span className="sr-only">{seats}</span>
      </div>

      <div style={{ marginTop: 28 }}>
        <ContinueToSquare />
      </div>
      <div style={{ marginTop: 10 }}>
        <BackLink href={`/classes/${e.id}`}>← back to the event</BackLink>
      </div>
      <p
        style={{
          margin: "24px auto 0",
          maxWidth: 380,
          fontSize: 12,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
        }}
      >
        your receipt comes from square; anything else about the class comes from
        me.
      </p>
    </div>
  );
}
