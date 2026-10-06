"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Photo } from "@/ui/Photo";
import { Sig } from "@/ui/Sig";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { SITE } from "@/lib/config";
import {
  CATALOG,
  MAX_QTY_PER_LINE,
  MIN_PIECES,
  CAT,
  defaultSize,
  TERMS,
  contactSchema,
  countPieces,
  numberWords,
  shortDate,
  sizeLabel,
  type BulkCode,
  type CatalogEntry,
  type Contact,
  type Size,
} from "@/lib/wholesale";
import {
  Action,
  Answered,
  Ask,
  Field,
  FillButton,
  LineTable,
  MinMeter,
  OrderCart,
  SmallLabel,
  StepRail,
  type SheetLine,
} from "./atoms";

/*
 * The bulk order — "the line sheet, asked". One big question per page with
 * the earlier answers settled above it, a ruled line sheet that fills as
 * pieces are added, and the whole order read back before it's sent.
 */

const STEPS = ["unlock", "about you", "the order", "the vision", "read back"];
const STEPS_SHORT = ["unlock", "you", "order", "vision", "read"];

type Step = "unlock" | "about" | "order" | "vision" | "review" | "sent";

type State = {
  step: Step;
  code: BulkCode | null;
  contact: Contact;
  lines: SheetLine[];
  inspiration: string;
  notes: string;
  consent: boolean;
  submissionId?: string;
};

const EMPTY: State = {
  step: "unlock",
  code: null,
  contact: { name: "", business: "", email: "", phone: "" },
  lines: [],
  inspiration: "",
  notes: "",
  consent: false,
};

// keeps a half-built order through a refresh; cleared once it's sent
const STORAGE_KEY = "ws-bulk-order-v2";

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function WholesaleFlow() {
  const [s, setS] = useState<State>(EMPTY);
  const restored = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // storage can be blocked — start fresh
    }
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      if (s.step === "sent") sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // not worth surfacing
    }
  }, [s]);

  // one id per order, made on reaching read back, so a retried send can't
  // create a second order in square
  useEffect(() => {
    if (s.step === "review" && !s.submissionId) {
      setS((prev) => ({ ...prev, submissionId: crypto.randomUUID() }));
    }
  }, [s.step, s.submissionId]);

  const update = (patch: Partial<State>) =>
    setS((prev) => ({ ...prev, ...patch }));

  const go = (step: Step) => {
    update({ step });
    window.scrollTo({ top: 0 });
    // let the new step render, then hand focus to its question
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>(".ws-ask")
        ?.focus({ preventScroll: true }),
    );
  };

  const code = s.code;
  if (s.step === "unlock" || !code) {
    return (
      <GateStep
        onUnlocked={(c) => {
          update({
            code: c,
          });
          go("about");
        }}
      />
    );
  }

  const count = countPieces(s.lines);
  const answeredCode = {
    label: "code",
    value: code.code.toLowerCase(),
    onChange: () => go("unlock"),
  };
  const answeredYou = {
    label: "you",
    value: s.contact.business,
    onChange: () => go("about"),
  };
  const answeredOrder = {
    label: "order",
    value: `${count} pieces`,
    onChange: () => go("order"),
  };
  const removeLine = (id: string) =>
    update({ lines: s.lines.filter((l) => l.id !== id) });

  switch (s.step) {
    case "about":
      return (
        <AboutStep
          contact={s.contact}
          answered={[answeredCode]}
          onChange={(contact) => update({ contact })}
          onBack={() => go("unlock")}
          onNext={() => go("order")}
        />
      );
    case "order":
      return (
        <OrderStep
          lines={s.lines}
          business={s.contact.business}
          answered={[answeredCode, answeredYou]}
          onAdd={(line) =>
            update({ lines: [...s.lines, { ...line, id: newId() }] })
          }
          onRemove={removeLine}
          onBack={() => go("about")}
          onNext={() => go("vision")}
        />
      );
    case "vision":
      return (
        <VisionStep
          code={code}
          inspiration={s.inspiration}
          notes={s.notes}
          answered={[answeredCode, answeredYou, answeredOrder]}
          onChange={(patch) => update(patch)}
          onBack={() => go("order")}
          onNext={() => go("review")}
        />
      );
    case "review":
      return (
        <ReviewStep
          state={s}
          code={code}
          onConsent={(consent) => update({ consent })}
          onEdit={go}
          onSent={() => go("sent")}
        />
      );
    case "sent":
      return <SentStep code={code} count={count} email={s.contact.email} />;
    default:
      return null;
  }
}

/* ── frame shared by steps 2–5 ──────────────────────────────────── */

function StepFrame({
  index,
  answered = [],
  children,
}: {
  index: number;
  answered?: Parameters<typeof Answered>[0]["items"];
  children: ReactNode;
}) {
  return (
    <div className="ws-pad">
      <div className="ws-steps">
        <div className="ws-rail ws-desktop-only">
          <StepRail steps={STEPS} current={index} />
        </div>
        <div className="ws-rail ws-mobile-only">
          <StepRail steps={STEPS_SHORT} current={index} />
        </div>
        <Answered items={answered} />
      </div>
      <div className="ws-body">{children}</div>
    </div>
  );
}

function StepNav({
  back,
  onBack,
  next,
  onNext,
  disabled,
  type = "button",
}: {
  back: string;
  onBack: () => void;
  next: string;
  onNext?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <div className="ws-nav">
      <Action color="var(--ink-soft)" onClick={onBack}>
        ← {back}
      </Action>
      <FillButton type={type} onClick={onNext} disabled={disabled}>
        {next}
      </FillButton>
    </div>
  );
}

const ErrorNote = ({ children }: { children: ReactNode }) => (
  <p
    role="alert"
    style={{
      margin: "14px 0 0",
      fontSize: 14,
      lineHeight: 1.5,
      color: "var(--topaze)",
    }}
  >
    {children}
  </p>
);

const instagramLink = (text: string) => (
  <a
    href={`https://instagram.com/${SITE.instagram}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      borderBottom: "1px solid var(--ink-soft)",
      color: "var(--ink)",
      textDecoration: "none",
    }}
  >
    {text}
  </a>
);

/* ── 1 · unlock — the photo beside the question ─────────────────── */

function GateStep({ onUnlocked }: { onUnlocked: (c: BulkCode) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReactNode>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const code = value.trim();
    if (!code) {
      setError("enter the code i sent you to get started.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wholesale/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.status === 404) {
        setError(
          "i don't recognise that code — check it against the one i sent you.",
        );
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data: { code: BulkCode } = await res.json();
      onUnlocked(data.code);
    } catch {
      setError(
        "something went wrong checking that — give it another try in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ws-gate">
      <form className="ws-gate-copy" onSubmit={submit} noValidate>
        <SmallLabel size={10}>
          for shops &amp; stockists ·{" "}
          <span className="ws-desktop-only">step </span>1 of 5
        </SmallLabel>
        <div style={{ marginTop: "clamp(14px, 2.4vw, 26px)" }}>
          <Ask
            xl
            q="do you have a code?"
            sub={
              <>
                <span className="ws-desktop-only">
                  bulk orders are for shops i&apos;ve already been in touch
                  with. if that&apos;s you, i&apos;ll have sent you a code —
                  enter it below to get started.
                </span>
                <span className="ws-mobile-only">
                  if we&apos;ve been in touch about a bulk order, enter the code
                  i sent you.
                </span>
              </>
            }
          />
        </div>
        <div
          className="ws-gate-code"
          style={{ marginTop: "clamp(30px, 4vw, 44px)" }}
        >
          <input
            id="ws-code"
            className="ws-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="YOUR-CODE"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={!!error}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--ink)",
              borderRadius: 0,
              padding: "0 0 12px",
              fontFamily: "var(--serif)",
              fontSize: "clamp(27px, 3vw, 32px)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "var(--ink)",
            }}
          />
          <label
            htmlFor="ws-code"
            style={{ display: "inline-block", marginTop: 12 }}
          >
            <SmallLabel>your code</SmallLabel>
          </label>
          {error && <ErrorNote>{error}</ErrorNote>}
        </div>
        <div className="ws-gate-actions">
          <FillButton type="submit" disabled={busy}>
            {busy ? "checking…" : "continue"}
          </FillButton>
          <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            don&apos;t have one? {instagramLink("get in touch")}
          </span>
        </div>
      </form>
      <div className="ws-gate-photo">
        <span className="ws-desktop-only">
          <Photo
            src="/assets/hero-group.png"
            ratio="auto"
            sizes="(min-width: 1024px) 50vw, 1px"
            style={{
              position: "absolute",
              inset: 0,
              height: "100%",
              background: "var(--paper-2)",
            }}
          />
        </span>
        <span className="ws-mobile-only">
          <Photo
            src="/assets/hero-square.png"
            ratio="auto"
            sizes="(max-width: 1023px) 100vw, 1px"
            style={{
              position: "absolute",
              inset: 0,
              height: "100%",
              background: "var(--paper-2)",
            }}
          />
        </span>
        <span
          style={{
            position: "absolute",
            left: 10,
            bottom: 9,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
            background: "rgba(237,227,208,0.82)",
            padding: "3px 7px",
          }}
        >
          from the spring run
        </span>
      </div>
    </div>
  );
}

/* ── 2 · about you ──────────────────────────────────────────────── */

function AboutStep({
  contact,
  answered,
  onChange,
  onBack,
  onNext,
}: {
  contact: Contact;
  answered: Parameters<typeof Answered>[0]["items"];
  onChange: (c: Contact) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>(
    {},
  );
  const set = (k: keyof Contact) => (v: string) => {
    onChange({ ...contact, [k]: v });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(contact);
    if (parsed.success) return onNext();
    const next: typeof errors = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof Contact;
      next[k] ??= issue.message;
    }
    setErrors(next);
  }

  return (
    <StepFrame index={1} answered={answered}>
      <form onSubmit={submit} noValidate>
        <Ask
          q="who am i talking to?"
          sub="so i know who to reply to. i'll only use this to talk about your order."
        />
        <div
          className="ws-fields"
          style={{ marginTop: "clamp(30px, 4vw, 40px)" }}
        >
          <Field
            label="your name"
            value={contact.name}
            onChange={set("name")}
            autoComplete="name"
            big
            error={errors.name}
          />
          <Field
            label="shop or business"
            value={contact.business}
            onChange={set("business")}
            autoComplete="organization"
            big
            error={errors.business}
          />
          <Field
            label="email"
            type="email"
            inputMode="email"
            value={contact.email}
            onChange={set("email")}
            autoComplete="email"
            big
            error={errors.email}
          />
          <Field
            label="phone (optional)"
            type="tel"
            inputMode="tel"
            value={contact.phone}
            onChange={set("phone")}
            autoComplete="tel"
            big
            error={errors.phone}
          />
        </div>
        <StepNav
          back="the code"
          onBack={onBack}
          next="to the order"
          type="submit"
        />
      </form>
    </StepFrame>
  );
}

/* ── 3 · the order — choices on the left, the line sheet beside ─── */

type Draft = { size?: Size; quantity: number; description: string };
const freshDraft = (c?: CatalogEntry): Draft => ({
  size: c && defaultSize(c),
  quantity: 1,
  description: "",
});

function OrderStep({
  lines,
  business,
  answered,
  onAdd,
  onRemove,
  onBack,
  onNext,
}: {
  lines: SheetLine[];
  business: string;
  answered: Parameters<typeof Answered>[0]["items"];
  onAdd: (l: Omit<SheetLine, "id">) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [open, setOpen] = useState<CatalogEntry["type"] | null>(null);
  const [draft, setDraft] = useState<Draft>(freshDraft);
  const [added, setAdded] = useState("");
  const count = countPieces(lines);

  const choose = (type: CatalogEntry["type"]) => {
    setOpen(open === type ? null : type);
    setDraft(freshDraft(CAT[type]));
  };

  const add = (c: CatalogEntry) => {
    onAdd({
      type: c.type,
      size: c.sizes.length ? draft.size : undefined,
      quantity: draft.quantity,
      description: draft.description.trim(),
    });
    setAdded(`added ${draft.quantity} × ${c.label} to your line sheet.`);
    setOpen(null);
    setDraft(freshDraft());
  };

  return (
    <StepFrame index={2} answered={answered}>
      <div className="ws-mobile-only" style={{ marginBottom: 26 }}>
        <OrderCart lines={lines} onRemove={onRemove} />
      </div>
      <div className="ws-split">
        <div>
          <Ask
            q="what would you like made?"
            sub={
              <>
                pick a piece, choose a size and quantity, then add it
                <span className="ws-desktop-only">
                  {" "}
                  to your line sheet. add as many as you need.
                </span>
                <span className="ws-mobile-only">.</span>
              </>
            }
          />
          <div
            style={{
              marginTop: "clamp(22px, 3vw, 36px)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {CATALOG.map((c) => (
              <Option
                key={c.type}
                c={c}
                on={open === c.type}
                onChoose={() => choose(c.type)}
              >
                <Drawer
                  c={c}
                  draft={draft}
                  onDraft={setDraft}
                  onAdd={() => add(c)}
                />
              </Option>
            ))}
          </div>
          <p
            role="status"
            aria-live="polite"
            style={{
              margin: "14px 0 0",
              minHeight: 20,
              fontSize: 14,
              color: "var(--ink-soft)",
            }}
          >
            {added}
          </p>
        </div>
        <aside
          className="ws-desktop-only ws-sticky"
          aria-label="your line sheet"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 18,
            }}
          >
            <CeramicLabel color="var(--ink)">your line sheet</CeramicLabel>
            <Sig size={24} style={{ textAlign: "right" }}>
              {business}
            </Sig>
          </div>
          <LineTable lines={lines} onRemove={onRemove} />
          <div style={{ marginTop: 26 }}>
            <MinMeter count={count} />
          </div>
        </aside>
      </div>
      <StepNav
        back="about you"
        onBack={onBack}
        next="to the vision"
        onNext={onNext}
        disabled={count < MIN_PIECES}
      />
    </StepFrame>
  );
}

function Option({
  c,
  on,
  onChoose,
  children,
}: {
  c: CatalogEntry;
  on: boolean;
  onChoose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${on ? "var(--ink)" : "var(--rule-strong)"}`,
        background: on ? "var(--paper-2)" : "transparent",
      }}
    >
      <button
        type="button"
        onClick={onChoose}
        aria-expanded={on}
        className="ws-option-head"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "baseline",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--serif)",
          color: "var(--ink)",
        }}
      >
        <span>
          <span
            className="ws-option-title"
            style={{
              display: "block",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {c.label}
          </span>
          <span
            style={{
              display: "block",
              marginTop: 7,
              fontSize: 14.5,
              lineHeight: 1.5,
              color: "var(--ink-soft)",
            }}
          >
            {c.note}
          </span>
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: on ? "var(--ink)" : "var(--ink-faint)",
          }}
        >
          {on ? "chosen" : "choose"}
        </span>
      </button>
      {on && children}
    </div>
  );
}

function Drawer({
  c,
  draft,
  onDraft,
  onAdd,
}: {
  c: CatalogEntry;
  draft: Draft;
  onDraft: (d: Draft) => void;
  onAdd: () => void;
}) {
  const setQty = (q: number) =>
    onDraft({
      ...draft,
      quantity: Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.round(q) || 1)),
    });
  const stepBtn = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 4px",
    fontFamily: "var(--serif)",
    fontSize: 18,
    color: "var(--ink-soft)",
  } as const;

  return (
    <div
      className="ws-drawer"
      style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end" }}
    >
      {c.sizes.length > 0 && (
        <div role="radiogroup" aria-label="size">
          <SmallLabel>size</SmallLabel>
          <div
            style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}
          >
            {c.sizes.map((s) => {
              const on = draft.size === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onDraft({ ...draft, size: s })}
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 13,
                    padding: "8px 16px",
                    border: `1px solid ${on ? "var(--ink)" : "var(--rule-strong)"}`,
                    background: on ? "var(--ink)" : "transparent",
                    color: on ? "var(--paper)" : "var(--ink-soft)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {sizeLabel(s)}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ width: 130 }}>
        <label htmlFor={`qty-${c.type}`}>
          <SmallLabel>quantity</SmallLabel>
        </label>
        <div
          style={{
            marginTop: 10,
            borderBottom: "1px solid rgba(36,35,34,0.32)",
            paddingBottom: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <input
            id={`qty-${c.type}`}
            className="ws-qty"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_QTY_PER_LINE}
            value={draft.quantity}
            onChange={(e) => setQty(Number(e.target.value))}
            style={{
              width: 56,
              background: "transparent",
              border: "none",
              fontFamily: "var(--serif)",
              fontSize: 18,
              color: "var(--ink)",
              padding: 0,
            }}
          />
          <span style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              aria-label="one fewer"
              style={stepBtn}
              onClick={() => setQty(draft.quantity - 1)}
            >
              –
            </button>
            <button
              type="button"
              aria-label="one more"
              style={stepBtn}
              onClick={() => setQty(draft.quantity + 1)}
            >
              +
            </button>
          </span>
        </div>
      </div>
      <div style={{ flex: "1 1 100%" }}>
        <Field
          label={
            c.type === "other" ? "what would you like?" : "details (optional)"
          }
          value={draft.description}
          onChange={(description) => onDraft({ ...draft, description })}
          placeholder={
            c.type === "other"
              ? "vases, planters, a custom piece…"
              : "a glaze, a color, a logo stamp…"
          }
        />
      </div>
      <Action size={10} style={{ marginBottom: 7 }} onClick={onAdd}>
        add to line sheet →
      </Action>
    </div>
  );
}

/* ── 4 · the vision ─────────────────────────────────────────────── */

function VisionStep({
  code,
  inspiration,
  notes,
  answered,
  onChange,
  onBack,
  onNext,
}: {
  code: BulkCode;
  inspiration: string;
  notes: string;
  answered: Parameters<typeof Answered>[0]["items"];
  onChange: (patch: { inspiration?: string; notes?: string }) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepFrame index={3} answered={answered}>
      <div style={{ maxWidth: 760 }}>
        <Ask
          q="what are you picturing?"
          sub="share any colors, styles, or inspiration you have in mind. nothing here is final — we'll talk it through together."
        />
        <div
          style={{
            marginTop: "clamp(30px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
          <Field
            label="got inspiration?"
            value={inspiration}
            onChange={(v) => onChange({ inspiration: v })}
            placeholder="a pinterest board, an instagram post, a website…"
            inputMode="url"
            big
          />
          <Field
            label="anything else i should know"
            value={notes}
            onChange={(v) => onChange({ notes: v })}
            placeholder="dates, colors, how the pieces will be used…"
            multiline
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
              borderTop: "1px solid var(--rule-strong)",
              paddingTop: 18,
            }}
          >
            <CeramicLabel color="var(--ink-faint)">
              estimated completion
            </CeramicLabel>
            <span
              style={{ fontSize: 22, fontWeight: 700, whiteSpace: "nowrap" }}
            >
              by {shortDate(code.earliest)}
            </span>
          </div>
        </div>
      </div>
      <StepNav
        back="the order"
        onBack={onBack}
        next="read it back"
        onNext={onNext}
      />
    </StepFrame>
  );
}

/* ── 5 · read back + terms ──────────────────────────────────────── */

function ReviewStep({
  state,
  code,
  onConsent,
  onEdit,
  onSent,
}: {
  state: State;
  code: BulkCode;
  onConsent: (v: boolean) => void;
  onEdit: (step: Step) => void;
  onSent: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const count = countPieces(state.lines);
  const canSend = state.consent && count >= MIN_PIECES && !busy;

  async function send() {
    if (!canSend) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wholesale/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.code,
          contact: state.contact,
          lines: state.lines.map(({ type, size, quantity, description }) => ({
            type,
            size,
            quantity,
            description,
          })),
          inspiration: state.inspiration,
          notes: state.notes,
          consent: state.consent,
          submissionId: state.submissionId,
        }),
      });
      if (res.ok) return onSent();
      setError(
        res.status === 503 ? (
          <>
            i can&apos;t take bulk orders through the site just yet —{" "}
            {instagramLink("send me a message")} and we&apos;ll sort it out.
          </>
        ) : (
          "something went wrong sending that — give it another try in a moment."
        ),
      );
    } catch {
      setError(
        "something went wrong sending that — give it another try in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <StepFrame index={4}>
      <Ask
        q="here's what i have."
        sub="look everything over and make any changes. when it all looks right, send it and i'll be in touch."
      />
      <div
        className="ws-split ws-split--review"
        style={{ marginTop: "clamp(30px, 4vw, 44px)" }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <SmallLabel>for</SmallLabel>
              <div
                style={{ marginTop: 6, fontSize: 22, overflowWrap: "anywhere" }}
              >
                {state.contact.business}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  overflowWrap: "anywhere",
                }}
              >
                {state.contact.name} · {state.contact.email}
              </div>
            </div>
            <div style={{ textAlign: "right", flex: "0 0 auto" }}>
              <SmallLabel>ready by</SmallLabel>
              <div style={{ marginTop: 6, fontSize: 22 }}>
                {shortDate(code.earliest)}
              </div>
            </div>
          </div>
          <LineTable lines={state.lines} />
          <div style={{ marginTop: 14 }}>
            <Action
              size={9}
              color="var(--ink-faint)"
              onClick={() => onEdit("order")}
            >
              change the order
            </Action>
          </div>
          <div
            style={{
              marginTop: 30,
              paddingTop: 22,
              borderTop: "1px solid var(--rule-soft)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
              }}
            >
              <SmallLabel>the note you left</SmallLabel>
              <Action
                size={9}
                color="var(--ink-faint)"
                onClick={() => onEdit("vision")}
              >
                change
              </Action>
            </div>
            {state.inspiration && (
              <p
                style={{
                  margin: "9px 0 0",
                  fontSize: 15,
                  color: "var(--ink-soft)",
                  overflowWrap: "anywhere",
                }}
              >
                {state.inspiration}
              </p>
            )}
            <p
              style={{
                margin: "9px 0 0",
                fontSize: 16,
                lineHeight: 1.55,
                overflowWrap: "anywhere",
              }}
            >
              {state.notes ? (
                `“${state.notes}”`
              ) : (
                <span style={{ color: "var(--ink-faint)" }}>
                  no note this time.
                </span>
              )}
            </p>
            {state.notes && (
              <Sig size={24} style={{ marginTop: 12 }}>
                — {state.contact.name.split(" ")[0]}
              </Sig>
            )}
          </div>
        </div>
        <div>
          <CeramicLabel color="var(--ink)">the terms</CeramicLabel>
          <ol style={{ margin: "14px 0 0", padding: 0, listStyle: "none" }}>
            {TERMS.map(([t, d], i) => (
              <li
                key={t}
                style={{
                  padding: "18px 0",
                  borderTop: "1px solid var(--rule-soft)",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 16,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--ink-faint)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <SmallLabel color="var(--ink)" size={10}>
                    {t}
                  </SmallLabel>
                  <p
                    style={{
                      margin: "7px 0 0",
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <label
            style={{
              marginTop: 22,
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={state.consent}
              onChange={(e) => onConsent(e.target.checked)}
              style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
              className="ws-check"
            />
            <span
              aria-hidden
              className="ws-check-box"
              style={{
                width: 18,
                height: 18,
                border: "1px solid var(--ink)",
                flex: "0 0 auto",
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            >
              {state.consent ? "✓" : ""}
            </span>
            <span style={{ fontSize: 15, lineHeight: 1.5 }}>
              everything looks right. i understand each piece is handmade, and
              that i&apos;ll be invoiced after we talk.
            </span>
          </label>
        </div>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <StepNav
        back="the vision"
        onBack={() => onEdit("vision")}
        next={busy ? "sending…" : "send to alicia"}
        onNext={send}
        disabled={!canSend}
      />
    </StepFrame>
  );
}

/* ── sent ───────────────────────────────────────────────────────── */

function SentStep({
  code,
  count,
  email,
}: {
  code: BulkCode;
  count: number;
  email: string;
}) {
  return (
    <div
      className="ws-pad"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingTop: "clamp(40px, 6vw, 60px)",
        paddingBottom: "clamp(20px, 6vw, 60px)",
      }}
    >
      <SmallLabel size={11}>bulk order · {code.code.toLowerCase()}</SmallLabel>
      <h1
        className="ws-ask ws-ask--xl"
        tabIndex={-1}
        style={{ marginTop: 24, maxWidth: 900 }}
      >
        thank you — i got your order.
      </h1>
      <p
        style={{
          margin: "22px 0 0",
          fontSize: "clamp(16px, 1.8vw, 19px)",
          lineHeight: 1.6,
          color: "var(--ink-soft)",
          maxWidth: 540,
          textWrap: "pretty",
        }}
      >
        {numberWords(count)} pieces, estimated for {shortDate(code.earliest)}.
        i&apos;ll look it over and get back to you within a day or two to go
        over the details. once we&apos;ve agreed, i&apos;ll send an invoice.
      </p>
      <div
        style={{
          marginTop: 36,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "16px 28px",
          alignItems: "center",
        }}
      >
        <Link
          href="/shop"
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink)",
            borderBottom: "1px solid var(--ink)",
            paddingBottom: 4,
            textDecoration: "none",
          }}
        >
          back to the shop
        </Link>
        <span
          style={{
            fontSize: 14,
            color: "var(--ink-soft)",
            overflowWrap: "anywhere",
          }}
        >
          i&apos;ll reply to {email}
        </span>
      </div>
      <Sig size={40} color="var(--ink)" style={{ marginTop: 56 }}>
        — a.
      </Sig>
    </div>
  );
}
