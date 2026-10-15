import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { SITE } from "@/lib/config";
import {
  dayOf,
  isLow,
  isMulti,
  isSoldOut,
  monthOf,
  seatNote,
  weekdayOf,
  type ClassEvent,
} from "@/lib/classes";

/* the quiet caption, at the site's smallest readable label size */
export const Label = ({
  children,
  color = "var(--ink-faint)",
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) => (
  <CeramicLabel color={color} style={{ fontSize: 11, ...style }}>
    {children}
  </CeramicLabel>
);

/*
 * The date numeral — the constant, since event names change every time. A
 * two-session class shows both numerals joined, so the commitment reads
 * before anyone clicks.
 */
export function DateBlock({
  e,
  size = "lg",
  dim,
  struck,
}: {
  e: ClassEvent;
  size?: "lg" | "sm";
  dim?: boolean;
  /* sold out in the list: the date is struck through */
  struck?: boolean;
}) {
  const one = (iso: string) => (
    <div key={iso} style={{ textAlign: "center", minWidth: 62 }}>
      <Label>{monthOf(iso)}</Label>
      <div
        className="cl-date-num"
        style={{
          marginTop: 4,
          fontWeight: 400,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          // sold out reads quieter, but stays legible (no transparency)
          color: dim ? "var(--ink-soft)" : "var(--ink)",
          textDecoration: struck ? "line-through" : undefined,
          textDecorationThickness: struck ? 1 : undefined,
        }}
      >
        {dayOf(iso)}
      </div>
      <div
        className="cl-date-day"
        style={{ marginTop: 6, color: "var(--ink-soft)" }}
      >
        {weekdayOf(iso)}
      </div>
    </div>
  );
  const cls = `cl-date${size === "lg" ? " cl-date--lg" : ""}`;
  // the date is said in words alongside, so the numerals are decoration
  if (!isMulti(e)) {
    return (
      <div className={cls} aria-hidden style={{ flexShrink: 0 }}>
        {one(e.sessions[0].date)}
      </div>
    );
  }
  return (
    <div
      className={cls}
      aria-hidden
      style={{ flexShrink: 0, textAlign: "center" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {one(e.sessions[0].date)}
        <span
          style={{
            fontSize: 18,
            color: "var(--ink-faint)",
            transform: "translateY(4px)",
          }}
        >
          &amp;
        </span>
        {one(e.sessions[1].date)}
      </div>
      <div
        style={{
          marginTop: 8,
          borderTop: "1px solid var(--rule-strong)",
          paddingTop: 7,
        }}
      >
        <Label color="var(--ink)" style={{ letterSpacing: "0.2em" }}>
          both sessions
        </Label>
      </div>
    </div>
  );
}

/* aliciapceramics × someone else */
export const CollabMark = ({
  e,
  color = "var(--ink)",
}: {
  e: ClassEvent;
  color?: string;
}) =>
  e.collab ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Label color={color}>aliciapceramics</Label>
      <span
        aria-label="with"
        style={{ fontSize: 14, color: "var(--ink-faint)" }}
      >
        ×
      </span>
      <Label color={color}>{e.collab.with}</Label>
    </span>
  ) : null;

/* a small square badge for subtypes and states */
export const EventBadge = ({
  children,
  quiet,
}: {
  children: ReactNode;
  quiet?: boolean;
}) => (
  <span
    style={{
      display: "inline-block",
      padding: "4px 10px",
      border: `1px solid ${quiet ? "var(--ink-faint)" : "var(--ink)"}`,
    }}
  >
    <Label color={quiet ? "var(--ink-faint)" : "var(--ink)"}>{children}</Label>
  </span>
);

/* seats — silent when there's room, plain when it's low or gone */
/* seats — in the same spaced capitals as "sold out"; plum when it's low */
export function SeatsNote({ e }: { e: ClassEvent }) {
  if (isSoldOut(e)) return <Label>sold out</Label>;
  return (
    <Label color={isLow(e) ? "var(--cassis)" : "var(--ink)"}>
      {seatNote(e)}
    </Label>
  );
}

/* the square handoff, said out loud so nobody is surprised */
export const SquareNote = ({ style }: { style?: CSSProperties }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 9, ...style }}>
    <span
      aria-hidden
      style={{
        width: 7,
        height: 7,
        border: "1px solid var(--ink-faint)",
        flexShrink: 0,
        transform: "translateY(-1px)",
      }}
    />
    <span style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>
      payment is handled by square — you&apos;ll finish checkout there.
    </span>
  </div>
);

/* key → value rows */
export const Facts = ({
  rows,
  style,
}: {
  rows: readonly (readonly [string, ReactNode])[];
  style?: CSSProperties;
}) => (
  <dl style={{ margin: 0, ...style }}>
    {rows.map(([k, v], i) => (
      <div
        key={k}
        className="cl-fact"
        style={{
          padding: "12px 0",
          borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)",
        }}
      >
        <dt>
          <Label>{k}</Label>
        </dt>
        <dd style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{v}</dd>
      </div>
    ))}
  </dl>
);

const linkLabel: CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  textDecoration: "none",
  minHeight: 24,
  display: "inline-flex",
  alignItems: "flex-end",
};

/* quiet underlined link */
export const QuietLink = ({
  href,
  children,
  color = "var(--ink)",
  style,
}: {
  href: string;
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) => (
  <Link
    href={href}
    style={{
      ...linkLabel,
      color,
      borderBottom: `1px solid ${color}`,
      paddingBottom: 4,
      ...style,
    }}
  >
    {children}
  </Link>
);

/* "← all events", with no underline */
export const BackLink = ({
  href = "/classes",
  children = "← all events",
}: {
  href?: string;
  children?: ReactNode;
}) => (
  <Link href={href} style={{ ...linkLabel, color: "var(--ink-soft)" }}>
    {children}
  </Link>
);

/* the one filled control, as a link */
export const FillLink = ({
  href,
  children,
  className = "",
  style,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => (
  <Link
    href={href}
    className={`ws-fill ${className}`}
    style={{
      display: "inline-block",
      textAlign: "center",
      padding: "16px 26px",
      background: "var(--ink)",
      color: "var(--paper)",
      fontFamily: "var(--serif)",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      textDecoration: "none",
      ...style,
    }}
  >
    {children}
  </Link>
);

/* an inline sentence link */
export const TextLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    style={{
      color: "var(--ink)",
      textDecoration: "none",
      borderBottom: "1px solid var(--ink)",
    }}
  >
    {children}
  </Link>
);

/* new dates and freed-up seats are posted on instagram — point there */
export function FollowInstagram({
  title,
  children,
  style,
}: {
  title?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--rule-strong)",
        padding: "26px 24px",
        textAlign: "left",
        ...style,
      }}
    >
      {title && (
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
      )}
      <p
        style={{
          margin: 0,
          fontSize: 15,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
        }}
      >
        {children}
      </p>
      <a
        href={`https://instagram.com/${SITE.instagram}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ws-fill"
        style={{
          marginTop: 20,
          display: "block",
          textAlign: "center",
          padding: "15px 20px",
          background: "var(--ink)",
          color: "var(--paper)",
          fontFamily: "var(--serif)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        follow @{SITE.instagram}
        <span className="sr-only"> on instagram (opens in a new tab)</span>
      </a>
    </div>
  );
}
