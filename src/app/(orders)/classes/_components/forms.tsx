"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Sig } from "@/ui/Sig";
import { Photo } from "@/ui/Photo";
import {
  FORMATS,
  formatFor,
  PLACES,
  PRIVATE,
  STUDIO,
  defaultPiece,
  fromPrice,
  hasChoice,
  hasUpgrades,
  isMulti,
  money,
  total,
  suggestedDates,
  PRIVATE_NOTE_MAX as NOTE_MAX,
  type SuggestedDate,
  type ClassEvent,
  type FormatId,
  type PlaceId,
} from "@/lib/classes";
import { Field, FillButton } from "../../_components/atoms";
import { Facts, Label, QuietLink, SeatsNote, SquareNote } from "./bits";

const email = z.email();

/* ── the booking panel: price, seats, each seat's piece ─────────── */
export function BookPanel({ e }: { e: ClassEvent }) {
  const router = useRouter();
  const [picks, setPicks] = useState<(string | null)[]>([defaultPiece(e)]);
  const n = picks.length;
  const multi = isMulti(e);
  const upgrades = hasUpgrades(e);
  const setSeats = (next: number) =>
    setPicks((prev) =>
      next > prev.length
        ? [...prev, ...Array(next - prev.length).fill(defaultPiece(e))]
        : prev.slice(0, next),
    );
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

  const book = () => {
    const q = new URLSearchParams({ seats: String(n) });
    if (hasChoice(e)) q.set("pieces", picks.join(","));
    router.push(`/classes/${e.id}/checkout?${q}`);
  };

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
          <Label>
            {multi ? "a seat, both sessions" : "a seat"}
            {upgrades ? ", from" : ""}
          </Label>
          <div style={{ marginTop: 6, fontSize: 30, fontWeight: 700 }}>
            {money(fromPrice(e))}
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
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            type="button"
            className="cl-step"
            style={step}
            aria-label="one fewer seat"
            disabled={n <= 1}
            onClick={() => setSeats(n - 1)}
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
            onClick={() => setSeats(n + 1)}
          >
            +
          </button>
        </div>
        <p
          style={{ margin: "12px 0 0", fontSize: 12, color: "var(--ink-soft)" }}
        >
          {e.seats
            ? `${e.left} of ${e.seats} seats still open`
            : `${e.left} ${e.left === 1 ? "seat" : "seats"} still open`}{" "}
          — bring a friend!
        </p>
      </div>

      {hasChoice(e) && (
        <div style={{ marginTop: 22 }}>
          {picks.map((pick, i) => (
            <fieldset
              key={i}
              style={{
                border: "none",
                margin: 0,
                padding: "14px 0",
                borderTop: "1px solid var(--rule-soft)",
                minWidth: 0,
              }}
            >
              <legend style={{ padding: 0, float: "left", width: "100%" }}>
                <Label>
                  {n === 1 ? "your piece" : `seat ${i + 1} — their piece`}
                </Label>
              </legend>
              <div
                style={{
                  clear: "both",
                  paddingTop: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {e.pieces.map((p) => {
                  const on = pick === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setPicks((prev) =>
                          prev.map((x, j) => (j === i ? p.id : x)),
                        )
                      }
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 13,
                        padding: "9px 13px",
                        cursor: "pointer",
                        textAlign: "left",
                        border: `1px solid ${on ? "var(--ink)" : "var(--rule-strong)"}`,
                        background: on ? "var(--ink)" : "transparent",
                        color: on ? "var(--paper)" : "var(--ink)",
                      }}
                    >
                      {p.name}
                      <span
                        style={{
                          marginLeft: 8,
                          color: on
                            ? "rgba(237,227,208,0.8)"
                            : "var(--ink-soft)",
                        }}
                      >
                        {p.extra > 0 ? `+${money(p.extra)}` : "included"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 8,
          paddingTop: 16,
          borderTop: "1px solid var(--rule-soft)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Label>total</Label>
        <div aria-live="polite" style={{ fontSize: 26 }}>
          {money(total(e, picks))}
        </div>
      </div>

      <FillButton
        type="button"
        style={{ marginTop: 18, width: "100%" }}
        onClick={book}
      >
        book {n} {n === 1 ? "seat" : "seats"}
      </FillButton>
      <SquareNote style={{ marginTop: 16 }} />
    </div>
  );
}

/* ── the handoff button ─────────────────────────────────────────── */
export function ContinueToSquare({
  id,
  picks,
}: {
  id: string;
  picks: (string | null)[];
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  async function go() {
    setBusy(true);
    setNote("");
    try {
      const res = await fetch("/api/classes/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pieces: picks }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setNote(
        data.preview
          ? "this is the preview — square checkout isn't connected here, so nothing was charged."
          : res.status === 409
            ? "those seats just went — head back and pick again."
            : "something went wrong reaching square — give it another try in a moment.",
      );
    } catch {
      setNote(
        "something went wrong reaching square — give it another try in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <FillButton
        type="button"
        disabled={busy}
        style={{ minWidth: 280, width: "100%", maxWidth: 360 }}
        onClick={go}
      >
        {busy ? "opening square…" : "continue to square →"}
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
        {note}
      </p>
    </div>
  );
}

/* ── private events: one honest page ────────────────────────────── */

type Request = {
  place: PlaceId;
  address: string;
  format: FormatId;
  dates: SuggestedDate[];
  guests: string;
  occasion: string;
  name: string;
  email: string;
  phone: string;
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
    format: formatFor(initialPlace),
    dates: [],
    guests: "",
    occasion: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  // one id per request, so a retried send can't make a second draft
  const [submissionId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState("");
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
      format: formatFor(place),
    }));

  const toggleDate = (d: SuggestedDate) => {
    set(
      "dates",
      r.dates.some((x) => x.date === d.date)
        ? r.dates.filter((x) => x.date !== d.date)
        : [...r.dates, d],
    );
    setErrors((prev) => ({ ...prev, dates: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const guests = Number(r.guests);
    const next: typeof errors = {
      address:
        away && !r.address.trim()
          ? "roughly where are we coming to?"
          : undefined,
      dates: r.dates.length === 0 ? "pick at least one date" : undefined,
      guests:
        !r.guests.trim() || !Number.isFinite(guests) || guests < 1
          ? "roughly how many of you?"
          : !away && guests > 10
            ? "the studio holds ten — for more, choose a place of your own"
            : undefined,
      name: r.name.trim() ? undefined : "your name, please",
      email: email.safeParse(r.email.trim()).success
        ? undefined
        : "that email doesn't look right",
      phone:
        !r.phone.trim() || r.phone.replace(/\D/g, "").length >= 10
          ? undefined
          : "that number looks short",
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
    setBusy(true);
    setSendError("");
    try {
      const res = await fetch("/api/classes/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          place: r.place,
          address: r.address,
          format: r.format,
          dates: r.dates.map(({ date, label }) => ({ date, label })),
          guests,
          occasion: r.occasion,
          name: r.name,
          email: r.email.trim(),
          phone: r.phone,
          notes: r.notes,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setSendError(
        "something went wrong sending that — give it another try in a moment.",
      );
      return;
    } finally {
      setBusy(false);
    }
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
              {away ? "the studio, brought to you." : PRIVATE.title}
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
                ? "clay, boards, tools and glaze, all brought to you! a backyard, an office or a hall works just as well as the studio. mug painting only, and travel gets added to the quote."
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
                    maxLength={120}
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
                    it&apos;s usually $40–90 around dallas. i need a table,
                    chairs and a parking spot near the door.
                  </p>
                </div>
              )}
            </Section>

            <Section
              title="a few dates that would work"
              hint="pick any that suit — more options means a faster yes."
            >
              <div
                data-error={errors.dates ? "" : undefined}
                tabIndex={errors.dates ? -1 : undefined}
                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                {chips.map((d) => {
                  const on = r.dates.some((x) => x.date === d.date);
                  return (
                    <button
                      key={d.date}
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
                      {d.label}
                    </button>
                  );
                })}
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
                maxLength={80}
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
                label="your email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={r.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
              />
              <Field
                label="phone (optional)"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={r.phone}
                onChange={(v) => set("phone", v)}
                error={errors.phone}
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
                placeholder="two of us have made pottery before, the rest are complete beginners."
                value={r.notes}
                maxLength={NOTE_MAX}
                onChange={(e) => set("notes", e.target.value)}
              />
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  textAlign: "right",
                }}
              >
                {NOTE_MAX - r.notes.length} characters left
              </p>
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
              <FillButton type="submit" className="cl-send" disabled={busy}>
                {busy ? "sending…" : "send this to alicia"}
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
            {sendError && (
              <p
                role="alert"
                style={{
                  margin: "-18px 0 0",
                  fontSize: 14,
                  color: "var(--ws-error)",
                }}
              >
                {sendError}
              </p>
            )}
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
              {away ? "— see you soon, a." : "— looking forward to it, a."}
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
          ["where", "here at the studio, or i bring the tools to you"],
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
          "a table everyone can sit around comfortably, with chairs",
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
  const dates = [...r.dates.map((d) => d.label.split(" · ")[0])]
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
            ["reply to", r.email.trim()],
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
