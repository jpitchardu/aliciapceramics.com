import { notFound, redirect } from "next/navigation";
import {
  isMulti,
  isSoldOut,
  money,
  parsePicks,
  pieceName,
  seatPrice,
  total,
  whenLabel,
} from "@/lib/classes";
import { getClass } from "@/lib/classes-square";
import {
  drinkExtra,
  drinkLabel,
  encodeDrinks,
  menuFor,
  parseDrinks,
} from "@/lib/drinks";
import { HOLD_MINUTES } from "@/lib/holds";
import { BackLink, DateBlock, EventBadge, Label } from "../../_components/bits";
import { ContinueToSquare } from "../../_components/forms";

export const dynamic = "force-dynamic";

/* the handoff to square — stated out loud, with the booking read back */
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ seats?: string; pieces?: string; drinks?: string }>;
}) {
  const e = await getClass((await params).id);
  if (!e) notFound();
  if (isSoldOut(e)) redirect(`/classes/${e.id}`);
  const q = await searchParams;
  const n = Math.max(1, Math.floor(Number(q.seats) || 1));
  const raw = q.pieces ? q.pieces.split(",") : Array(n).fill(null);
  const picks = parsePicks(
    e,
    raw.slice(0, n).length === n ? raw.slice(0, n) : [],
  );
  // a collab with a drink menu needs one drink per seat
  const menu = menuFor(e);
  const drinks = menu ? parseDrinks(menu, q.drinks, n) : null;
  // a stale or edited link goes back to the class to choose again
  if (!picks || (menu && !drinks)) redirect(`/classes/${e.id}`);
  const drinkTotal =
    menu && drinks ? drinks.reduce((t, d) => t + drinkExtra(menu, d), 0) : 0;

  // seats making the same piece read back as one line
  const lines = [...new Set(picks)].map((p) => ({
    piece: pieceName(e, p),
    count: picks.filter((x) => x === p).length,
    each: seatPrice(e, p),
  }));
  const seatWord = n === 1 ? "seat" : "seats";

  return (
    <div
      className="cl-wrap"
      style={{ maxWidth: 620, textAlign: "center", paddingBottom: 10 }}
    >
      <Label>almost there</Label>
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
        there. once you continue, your {seatWord} {n === 1 ? "is" : "are"} held
        for {HOLD_MINUTES} minutes while you pay.
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
        <ul
          style={{
            listStyle: "none",
            margin: "12px 0 0",
            padding: "12px 0 0",
            borderTop: "1px solid var(--rule-soft)",
          }}
        >
          {lines.map((l) => (
            <li
              key={l.piece ?? "seat"}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "5px 0",
                fontSize: 15,
              }}
            >
              <span>
                {l.count} × {l.piece ? `seat · ${l.piece}` : "seat"}
              </span>
              <span style={{ color: "var(--ink-soft)" }}>
                {money(l.each * l.count)}
              </span>
            </li>
          ))}
        </ul>
        {menu && drinks && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--rule-soft)",
            }}
          >
            <Label>drinks from {menu.from}</Label>
            <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0 }}>
              {drinks.map((d, i) => {
                const extra = drinkExtra(menu, d);
                return (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "5px 0",
                      fontSize: 15,
                    }}
                  >
                    <span>
                      {n > 1 && `seat ${i + 1} · `}
                      {drinkLabel(menu, d)}
                    </span>
                    <span style={{ color: "var(--ink-soft)", flexShrink: 0 }}>
                      {extra > 0 ? `+${money(extra)}` : "included"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div
          style={{
            marginTop: 12,
            paddingTop: 14,
            borderTop: "1px solid var(--rule-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
            {n} {seatWord}
            {isMulti(e) ? ", both sessions" : ""}
          </span>
          <span style={{ fontSize: 28, fontWeight: 700 }}>
            {money(total(e, picks) + drinkTotal)}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <ContinueToSquare
          id={e.id}
          picks={picks}
          drinks={drinks ? encodeDrinks(drinks) : undefined}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <BackLink href={`/classes/${e.id}`}>← back to the class</BackLink>
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
        me!
      </p>
    </div>
  );
}
