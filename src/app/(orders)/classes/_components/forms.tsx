"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Sig } from "@/ui/Sig";
import { Photo } from "@/ui/Photo";
import {
  FORMATS,
  PLACES,
  PRIVATE,
  STUDIO,
  isMulti,
  money,
  suggestedDates,
  type ClassEvent,
  type FormatId,
  type PlaceId,
} from "@/lib/classes";
import { Field, FillButton } from "../../_components/atoms";
import { Facts, Label, QuietLink, SeatsNote, SquareNote } from "./bits";

const email = z.email();

/* a short "got it" that replaces a small form once it's sent */
const Thanks = ({ children }: { children: React.ReactNode }) => (
  <p role="status" style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
    {children}
  </p>
);

/* ── the quiet month: tell me when dates go up ──────────────────── */
export function NotifyMe() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.safeParse(value.trim()).success) {
      setError("that email doesn't look right");
      return;
    }
    // preview: nothing is stored yet
    setDone(true);
  }

  return (
    <div
      style={{
        margin: "32px auto 0",
        maxWidth: 400,
        textAlign: "left",
        border: "1px solid var(--rule-strong)",
        padding: "24px 26px 26px",
      }}
    >
      <Label color="var(--ink)">tell me when dates go up</Label>
      {done ? (
        <div style={{ marginTop: 16 }}>
          <Thanks>
            thank you — i&apos;ll write when the next dates are up.
          </Thanks>
        </div>
      ) : (
        <form onSubmit={submit} noValidate style={{ marginTop: 16 }}>
          <Field
            label="your email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={value}
            onChange={(v) => {
              setValue(v);
              setError("");
            }}
            error={error}
          />
          <FillButton
            type="submit"
            style={{ marginTop: 20, width: "100%", padding: "14px 20px" }}
          >
            let me know
          </FillButton>
        </form>
      )}
    </div>
  );
}

/* ── sold out: the wait-list ────────────────────────────────────── */
export function WaitList({ e }: { e: ClassEvent }) {
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; mail?: string }>({});
  const [done, setDone] = useState(false);

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const next = {
      name: name.trim() ? undefined : "your name, please",
      mail: email.safeParse(mail.trim()).success
        ? undefined
        : "that email doesn't look right",
    };
    setErrors(next);
    if (next.name || next.mail) return;
    setDone(true);
  }

  return (
    <div
      style={{ border: "1px solid var(--rule-strong)", padding: "26px 24px" }}
    >
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400, lineHeight: 1.2 }}>
        all {e.seats} seats are taken.
      </h2>
      {done ? (
        <div style={{ marginTop: 14 }}>
          <Thanks>
            you&apos;re on the list, {name.trim().split(" ")[0]}. i&apos;ll
            write the moment a seat opens up.
          </Thanks>
        </div>
      ) : (
        <>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 15,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
            }}
          >
            leave your name and i&apos;ll write the moment someone drops out —
            it happens more often than you&apos;d think.
          </p>
          <form
            onSubmit={submit}
            noValidate
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <Field
              label="your name"
              autoComplete="name"
              value={name}
              onChange={setName}
              error={errors.name}
            />
            <Field
              label="your email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={mail}
              onChange={setMail}
              error={errors.mail}
            />
            <FillButton type="submit" style={{ marginTop: 6, width: "100%" }}>
              join the wait-list
            </FillButton>
          </form>
        </>
      )}
    </div>
  );
}

/* ── the booking panel: price, how many seats, the one button ───── */
export function BookPanel({ e }: { e: ClassEvent }) {
  const router = useRouter();
  const [n, setN] = useState(1);
  const multi = isMulti(e);
  const step = {
    width: 40,
    height: 40,
    border: "1px solid var(--rule-strong)",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontFamily: "var(--serif)",
    fontSize: 17,
    color: "var(--ink)",
  } as const;

  return (
    <div
      style={{
        border: "1px solid var(--rule-strong)",
        background: "var(--paper-2)",
        padding: "26px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          paddingBottom: 18,
          borderBottom: "1px solid var(--rule-soft)",
        }}
      >
        <div>
          <Label>{multi ? "a seat, both sessions" : "a seat"}</Label>
          <div style={{ marginTop: 6, fontSize: 30, fontWeight: 700 }}>
            {money(e.price)}
          </div>
        </div>
        <SeatsNote e={e} />
      </div>

      {e.sessionNote && (
        <p
          style={{
            margin: "16px 0 0",
            padding: "12px 14px",
            border: "1px solid var(--rule-strong)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {e.sessionNote}
        </p>
      )}

      <div
        role="group"
        aria-labelledby={`seats-${e.id}`}
        style={{ marginTop: 22 }}
      >
        <Label>
          <span id={`seats-${e.id}`}>how many seats</span>
        </Label>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              className="cl-step"
              style={step}
              aria-label="one fewer seat"
              disabled={n <= 1}
              onClick={() => setN((v) => Math.max(1, v - 1))}
            >
              –
            </button>
            <output
              aria-live="polite"
              aria-label={`${n} ${n === 1 ? "seat" : "seats"}`}
              style={{ minWidth: 26, textAlign: "center", fontSize: 28 }}
            >
              {n}
            </output>
            <button
              type="button"
              className="cl-step"
              style={step}
              aria-label="one more seat"
              disabled={n >= e.left}
              onClick={() => setN((v) => Math.min(e.left, v + 1))}
            >
              +
            </button>
          </div>
          <div style={{ textAlign: "right" }}>
            <Label>total</Label>
            <div style={{ marginTop: 5, fontSize: 26 }}>
              {money(e.price * n)}
            </div>
          </div>
        </div>
        <p
          style={{ margin: "12px 0 0", fontSize: 12, color: "var(--ink-soft)" }}
        >
          {e.left} of {e.seats} seats still open — bring whoever you like.
        </p>
      </div>

      <FillButton
        type="button"
        style={{ marginTop: 22, width: "100%" }}
        onClick={() => router.push(`/classes/${e.id}/checkout?seats=${n}`)}
      >
        book {n} {n === 1 ? "seat" : "seats"}
      </FillButton>
      <SquareNote style={{ marginTop: 16 }} />
    </div>
  );
}

/* ── the handoff button: in the preview, nothing is charged ────── */
export function ContinueToSquare() {
  const [tried, setTried] = useState(false);
  return (
    <div>
      <FillButton
        type="button"
        style={{ minWidth: 280, width: "100%", maxWidth: 360 }}
        onClick={() => setTried(true)}
      >
        continue to square →
      </FillButton>
      <p
        role="status"
        style={{
          margin: "14px auto 0",
          maxWidth: 360,
          minHeight: 20,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--ink-soft)",
        }}
      >
        {tried &&
          "this is the preview — square checkout isn't connected yet, so nothing was charged."}
      </p>
    </div>
  );
}

/* ── private events: one honest page ────────────────────────────── */

type Request = {
  place: PlaceId;
  address: string;
  format: FormatId;
  dates: string[];
  ownDate: string;
  guests: string;
  occasion: string;
  name: string;
  contact: string;
  notes: string;
};

/* a selectable tile — a toggle button, so it's announced as on or off */
function Choice({
  on,
  disabled,
  onClick,
  title,
  aside,
  note,
  foot,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  aside?: string;
  note: string;
  foot?: [string, string];
}) {
  const soft = on ? "rgba(237,227,208,0.82)" : "var(--ink-soft)";
  return (
    <button
      type="button"
      className="cl-choice"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "18px 20px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "var(--serif)",
        border: `1px solid ${on ? "var(--ink)" : "var(--rule-strong)"}`,
        background: on ? "var(--ink)" : "transparent",
        color: on ? "var(--paper)" : "var(--ink)",
      }}
    >
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 20 }}>{title}</span>
        {aside && <Label color={soft}>{aside}</Label>}
      </span>
      <span
        style={{
          display: "block",
          marginTop: 8,
          fontSize: 14,
          lineHeight: 1.5,
          color: soft,
        }}
      >
        {note}
      </span>
      {foot && (
        <span
          style={{
            marginTop: 14,
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            flexWrap: "wrap",
            borderTop: `1px solid ${on ? "rgba(237,227,208,0.3)" : "var(--rule-soft)"}`,
          }}
        >
          <span style={{ fontSize: 15 }}>{foot[0]}</span>
          <Label color={soft}>{foot[1]}</Label>
        </span>
      )}
    </button>
  );
}

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <fieldset style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}>
    <legend style={{ padding: 0 }}>
      <Label color="var(--ink)">{title}</Label>
    </legend>
    {hint && (
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
        {hint}
      </p>
    )}
    <div style={{ marginTop: 14 }}>{children}</div>
  </fieldset>
);

export function PrivateForm({
  initialPlace,
  today,
}: {
  initialPlace: PlaceId;
  /* YYYY-MM-DD, from the server, so suggested dates match on both sides */
  today: string;
}) {
  const [r, setR] = useState<Request>({
    place: initialPlace,
    address: "",
    format: "handbuilding",
    dates: [],
    ownDate: "",
    guests: "",
    occasion: "",
    name: "",
    contact: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Request, string>>>(
    {},
  );
  const [sent, setSent] = useState(false);
  const chips = suggestedDates(new Date(`${today}T12:00:00Z`));
  const away = r.place === "yours";

  const set = <K extends keyof Request>(k: K, v: Request[K]) => {
    setR((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const choosePlace = (place: PlaceId) =>
    setR((prev) => ({
      ...prev,
      place,
      // the wheels don't travel
      format: place === "yours" ? "handbuilding" : prev.format,
    }));

  const toggleDate = (d: string) => {
    set(
      "dates",
      r.dates.includes(d) ? r.dates.filter((x) => x !== d) : [...r.dates, d],
    );
    setErrors((prev) => ({ ...prev, dates: undefined }));
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const guests = Number(r.guests);
    const next: typeof errors = {
      address:
        away && !r.address.trim()
          ? "roughly where are we coming to?"
          : undefined,
      dates:
        r.dates.length === 0 && !r.ownDate.trim()
          ? "pick a date or write one of your own"
          : undefined,
      guests:
        !r.guests.trim() || !Number.isFinite(guests) || guests < 1
          ? "roughly how many of you?"
          : !away && guests > 10
            ? "the studio holds ten — for more, choose a place of your own"
            : undefined,
      name: r.name.trim() ? undefined : "your name, please",
      contact:
        email.safeParse(r.contact.trim()).success ||
        r.contact.replace(/\D/g, "").length >= 10
          ? undefined
          : "an email or a phone number, please",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(
            '.cl-private [aria-invalid="true"], .cl-private [data-error]',
          )
          ?.focus(),
      );
      return;
    }
    // preview: nothing is sent yet
    setSent(true);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".cl-sent h1")?.focus(),
    );
  }

  if (sent) return <PrivateSent r={r} />;

  return (
    <div className="cl-wrap cl-private">
      <form onSubmit={submit} noValidate>
        <div
          style={{ borderTop: "1px solid var(--rule-strong)", paddingTop: 30 }}
        >
          <div style={{ maxWidth: 620 }}>
            <Label>{away ? "by request · we come to you" : "by request"}</Label>
            <h1
              className="cl-title-xl"
              tabIndex={-1}
              style={{
                margin: "14px 0 0",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.04,
                outline: "none",
              }}
            >
              {away ? "the bench, brought to you." : PRIVATE.title}
            </h1>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: 18,
                color: "var(--ink-soft)",
                lineHeight: 1.6,
              }}
            >
              {away
                ? "clay, boards, tools and aprons pack into the van — so a backyard, an office or a hall works just as well as the studio. handbuilding only, and travel gets added to the quote."
                : PRIVATE.blurb}
            </p>
          </div>
        </div>

        <div className="cl-detail cl-detail--private" style={{ marginTop: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
            <Section
              title="where you'd like it"
              hint="the studio holds ten comfortably — past that, or if you'd rather stay put, i'll come to you."
            >
              <div className="cl-two">
                {PLACES.map((p) => (
                  <Choice
                    key={p.id}
                    on={p.id === r.place}
                    onClick={() => choosePlace(p.id)}
                    title={p.title}
                    aside={p.cap ? `max ${p.cap}` : undefined}
                    note={p.note}
                    foot={[p.price, p.limit]}
                  />
                ))}
              </div>
              {away && (
                <div style={{ marginTop: 18 }}>
                  <Field
                    label="where are we coming to"
                    placeholder="a backyard in oak cliff — i'll send the address"
                    value={r.address}
                    onChange={(v) => set("address", v)}
                    error={errors.address}
                  />
                  <p
                    style={{
                      margin: "12px 0 0",
                      fontSize: 13,
                      color: "var(--ink-soft)",
                      lineHeight: 1.6,
                    }}
                  >
                    i&apos;ll work the travel into the quote once i know where —
                    it&apos;s usually $40–90 around dallas. i need a table, a
                    tap and a parking spot near the door.
                  </p>
                </div>
              )}
            </Section>

            <Section title="what you'd like to make">
              <div className="cl-two">
                {FORMATS.map((f) => {
                  const off = away && f.id === "wheel";
                  return (
                    <Choice
                      key={f.id}
                      on={r.format === f.id}
                      disabled={off}
                      onClick={() => set("format", f.id)}
                      title={f.title}
                      note={
                        off ? "studio only — the wheels don't travel" : f.note
                      }
                    />
                  );
                })}
              </div>
            </Section>

            <Section
              title="a few dates that would work"
              hint="pick any that suit, or write your own — more options means a faster yes."
            >
              <div
                data-error={errors.dates ? "" : undefined}
                tabIndex={errors.dates ? -1 : undefined}
                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                {chips.map((d) => {
                  const on = r.dates.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleDate(d)}
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 13,
                        padding: "10px 15px",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        border: `1px solid ${on ? "var(--ink)" : "var(--rule-strong)"}`,
                        background: on ? "var(--ink)" : "transparent",
                        color: on ? "var(--paper)" : "var(--ink-soft)",
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 16 }}>
                <Field
                  label="or a date of your own"
                  placeholder="the week of nov 9th, any evening…"
                  value={r.ownDate}
                  onChange={(v) => {
                    set("ownDate", v);
                    setErrors((prev) => ({ ...prev, dates: undefined }));
                  }}
                  error={errors.dates}
                />
              </div>
            </Section>

            <div className="cl-two cl-two--fields">
              <Field
                label="how many of you"
                inputMode="text"
                placeholder={away ? "roughly 14" : "roughly 8"}
                value={r.guests}
                onChange={(v) => set("guests", v.replace(/[^\d]/g, ""))}
                error={errors.guests}
              />
              <Field
                label="what's the occasion (optional)"
                placeholder="my sister's birthday"
                value={r.occasion}
                onChange={(v) => set("occasion", v)}
              />
              <Field
                label="your name"
                autoComplete="name"
                value={r.name}
                onChange={(v) => set("name", v)}
                error={errors.name}
              />
              <Field
                label="how to reach you"
                placeholder="an email or a phone number"
                autoComplete="email"
                value={r.contact}
                onChange={(v) => set("contact", v)}
                error={errors.contact}
              />
            </div>

            <div>
              <label htmlFor="cl-notes">
                <Label color="var(--ink)">
                  anything i should know (optional)
                </Label>
              </label>
              <textarea
                id="cl-notes"
                className="cl-textarea"
                style={{ marginTop: 10 }}
                placeholder="two of us have thrown before, the rest are complete beginners."
                value={r.notes}
                maxLength={2000}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>

            <div
              style={{
                paddingTop: 24,
                borderTop: "1px solid var(--rule-strong)",
                display: "flex",
                alignItems: "center",
                gap: "14px 24px",
                flexWrap: "wrap",
              }}
            >
              <FillButton type="submit" className="cl-send">
                send this to alicia
              </FillButton>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  maxWidth: 280,
                  lineHeight: 1.5,
                }}
              >
                nothing&apos;s charged — this starts a conversation, not a
                booking.
              </span>
            </div>
          </div>

          <aside
            className="cl-sticky cl-private-aside"
            aria-label="how a private event works"
          >
            <Photo
              src={PRIVATE.photo}
              ratio="4 / 3"
              sizes="(min-width: 1024px) 420px, 100vw"
            />
            <div style={{ marginTop: 20 }}>
              <PrivateTerms />
            </div>
            {away && <SpaceNeeds />}
            <Sig size={28} style={{ marginTop: 24 }}>
              {away ? "— happy to travel, a." : "— looking forward to it, a."}
            </Sig>
          </aside>
        </div>
      </form>
    </div>
  );
}

function PrivateTerms() {
  return (
    <div
      style={{
        border: "1px solid var(--rule-strong)",
        padding: "24px 24px",
        background: "var(--paper-2)",
      }}
    >
      <Label color="var(--ink)">how a private event works</Label>
      <Facts
        style={{ marginTop: 12 }}
        rows={[
          ["where", "here at the studio, or i bring the bench to you"],
          ["how many", "6–10 at the studio · more if we come to you"],
          ["how much", `${PRIVATE.priceNote} — travel added if i'm coming out`],
          ["how long", "about two hours, plus time to sit"],
          ["when", PRIVATE.windows.join(" · ")],
          [
            "to confirm",
            "i reply by hand within a day or two, then take a deposit",
          ],
        ]}
      />
    </div>
  );
}

function SpaceNeeds() {
  return (
    <div
      style={{
        marginTop: 20,
        border: "1px solid var(--rule-strong)",
        padding: "22px 24px",
      }}
    >
      <Label color="var(--ink)">what i need from the space</Label>
      <ul
        style={{
          margin: "14px 0 0",
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        {[
          "a table everyone can sit around",
          "a tap and a sink within reach",
          "somewhere to park near the door",
          "about an hour before and after to set up",
        ].map((s) => (
          <li
            key={s}
            style={{ display: "flex", alignItems: "baseline", gap: 10 }}
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                background: "var(--ink-faint)",
                flexShrink: 0,
                transform: "translateY(-2px)",
              }}
            />
            <span style={{ fontSize: 14, lineHeight: 1.5 }}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrivateSent({ r }: { r: Request }) {
  const place = PLACES.find((p) => p.id === r.place)!;
  const format = FORMATS.find((f) => f.id === r.format)!;
  const dates = [...r.dates.map((d) => d.split(" · ")[0]), r.ownDate.trim()]
    .filter(Boolean)
    .join(" · ");
  const where = r.place === "studio" ? "here at the studio" : "at your place";
  return (
    <div
      className="cl-wrap cl-sent"
      style={{ textAlign: "center", maxWidth: 660, paddingBottom: 20 }}
    >
      <div
        aria-hidden
        style={{
          margin: "20px auto 0",
          width: 80,
          height: 80,
          borderRadius: 999,
          background: "var(--cassis)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sig size={24} color="var(--paper)">
          sent
        </Sig>
      </div>
      <h1
        className="cl-title-xl"
        tabIndex={-1}
        style={{
          margin: "28px 0 0",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.06,
          outline: "none",
        }}
      >
        that&apos;s with me — thank you.
      </h1>
      <p
        style={{
          margin: "18px auto 0",
          maxWidth: 470,
          fontSize: 17,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
        }}
      >
        i&apos;ve got {format.title} for {r.guests} {where}. i&apos;ll write
        back within a day or two with a plan and a price — and if none of the
        dates hold, we&apos;ll find one that does.
      </p>
      <div
        style={{
          margin: "30px auto 0",
          border: "1px solid var(--rule-strong)",
          background: "var(--paper-2)",
          padding: "20px 24px",
          textAlign: "left",
          maxWidth: 440,
        }}
      >
        <Label>what you asked for</Label>
        <Facts
          style={{ marginTop: 8 }}
          rows={[
            ["where", r.place === "studio" ? place.title : r.address.trim()],
            ["making", format.title],
            ["how many", `roughly ${r.guests}`],
            ["dates", dates],
            ["reply to", r.contact.trim()],
          ]}
        />
      </div>
      <Sig size={32} color="var(--ink)" style={{ marginTop: 26 }}>
        — a.
      </Sig>
      <div style={{ marginTop: 28 }}>
        <QuietLink href="/classes">see what else is on →</QuietLink>
      </div>
      <p style={{ margin: "26px 0 0", fontSize: 12, color: "var(--ink-soft)" }}>
        the studio is at {STUDIO.split(",")[0]}.
      </p>
    </div>
  );
}
