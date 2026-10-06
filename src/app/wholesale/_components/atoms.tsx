"use client";

import {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { CeramicLabel } from "@/ui/CeramicLabel";
import {
  CAT,
  MIN_PIECES,
  countPieces,
  lineLabel,
  sizeLabel,
  type OrderLine,
} from "@/lib/wholesale";

/* A line on the sheet carries a client-side id so it can be removed. */
export type SheetLine = OrderLine & { id: string };

/* the quiet field captions — the design drew them at 9px; 11px (the site's
 * label size) is the smallest that stays readable in spaced capitals */
export const SmallLabel = ({
  children,
  color = "var(--ink-faint)",
  size = 11,
  style,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  style?: CSSProperties;
}) => (
  <CeramicLabel color={color} style={{ fontSize: size, ...style }}>
    {children}
  </CeramicLabel>
);

/* the one filled control per surface */
export function FillButton({
  children,
  style,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`ws-fill ${className}`}
      style={{
        padding: "17px 30px",
        background: "var(--ink)",
        color: "var(--paper)",
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--serif)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* quiet underline action — everything that isn't the one primary */
export function Action({
  children,
  color = "var(--ink)",
  size = 11,
  style,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: string;
  size?: number;
}) {
  return (
    <button
      type="button"
      style={{
        background: "none",
        border: "none",
        borderBottom: `1px solid ${color}`,
        padding: "0 0 4px",
        // a 24px-tall target (WCAG 2.5.8) without moving the underline
        minHeight: 24,
        display: "inline-flex",
        alignItems: "flex-end",
        cursor: "pointer",
        fontFamily: "var(--serif)",
        fontSize: size,
        fontWeight: 400,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

const fieldInput: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 9,
  padding: "0 0 9px",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(36,35,34,0.32)",
  borderRadius: 0,
  fontFamily: "var(--serif)",
  fontWeight: 400,
  color: "var(--ink)",
};

/* underlined text field — label above, value on a hairline */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  big,
  multiline,
  autoComplete,
  error,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  big?: boolean;
  multiline?: boolean;
  autoComplete?: string;
  error?: string;
  inputMode?: "text" | "email" | "tel" | "url";
}) {
  const id = useId();
  const style: CSSProperties = {
    ...fieldInput,
    fontSize: big ? 19 : 16,
    ...(multiline
      ? { minHeight: 76, resize: "vertical", lineHeight: 1.5 }
      : {}),
  };
  return (
    <div>
      <label htmlFor={id}>
        <SmallLabel>{label}</SmallLabel>
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="ws-input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...style, fontSize: 17 }}
          rows={3}
        />
      ) : (
        <input
          id={id}
          className="ws-input"
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => onChange(e.target.value)}
          style={style}
        />
      )}
      {error && (
        <div
          id={`${id}-err`}
          style={{ marginTop: 8, fontSize: 13, color: "var(--ws-error)" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export const Dot = ({ color = "var(--sauge)", size = 5 }) => (
  <span
    aria-hidden
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      background: color,
      display: "inline-block",
      flex: "0 0 auto",
    }}
  />
);

/* the stepped progress rail — the current step is named, the rest numbered */
export function StepRail({
  steps,
  current,
}: {
  steps: readonly string[];
  current: number;
}) {
  return (
    <ol
      aria-label={`step ${current + 1} of ${steps.length}: ${steps[current]}`}
      style={{
        display: "flex",
        alignItems: "center",
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {steps.map((s, i) => (
        <li
          key={s}
          aria-current={i === current ? "step" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            flex: i === steps.length - 1 ? "0 0 auto" : "1 1 auto",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
              letterSpacing: i === current ? 0 : "0.16em",
              color: i <= current ? "var(--ink)" : "var(--ink-faint)",
            }}
          >
            {i === current ? s : i + 1}
          </span>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              style={{
                flex: "1 1 auto",
                minWidth: 12,
                height: 1,
                margin: "0 clamp(8px, 2vw, 16px)",
                background: i < current ? "var(--ink)" : "var(--rule-strong)",
              }}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

/* answered steps — settle above the question, each with a way back */
export function Answered({
  items,
}: {
  items: readonly { label: string; value: string; onChange: () => void }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="ws-answered">
      {items.map(({ label, value, onChange }) => (
        <span
          key={label}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            minWidth: 0,
          }}
        >
          <SmallLabel>{label}</SmallLabel>
          <span
            style={{
              fontSize: 15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            {value}
          </span>
          <Action
            color="var(--ink-faint)"
            style={{ paddingBottom: 2, flex: "0 0 auto" }}
            onClick={onChange}
            aria-label={`change ${label}`}
          >
            change
          </Action>
        </span>
      ))}
    </div>
  );
}

/* the big question */
export function Ask({
  q,
  sub,
  xl,
}: {
  q: string;
  sub?: ReactNode;
  xl?: boolean;
}) {
  return (
    <div>
      <h1 className={`ws-ask${xl ? " ws-ask--xl" : ""}`} tabIndex={-1}>
        {q}
      </h1>
      {sub && <p className="ws-ask-sub">{sub}</p>}
    </div>
  );
}

/* progress toward the ten-piece minimum — ambient, never a warning */
export function MinMeter({ count }: { count: number }) {
  const met = count >= MIN_PIECES;
  const pct = Math.min(1, count / MIN_PIECES);
  return (
    <div role="status" aria-live="polite">
      <SmallLabel>a bulk order is ten pieces or more</SmallLabel>
      <div
        aria-hidden
        style={{
          marginTop: 10,
          height: 1,
          background: "var(--rule-strong)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: -1,
            height: 3,
            width: `${pct * 100}%`,
            background: "var(--ink)",
          }}
          className="ws-meter-fill"
        />
      </div>
      <div style={{ marginTop: 10, fontSize: 15, color: "var(--ink-soft)" }}>
        {met
          ? `that's ${count} pieces — you're past ten, whenever you're ready.`
          : `${count} so far · ${MIN_PIECES - count} more to reach ten.`}
      </div>
    </div>
  );
}

/*
 * Removing a line deletes the button that had focus, so hand focus to the
 * next line's remove button (or the previous, or the sheet itself) rather
 * than letting it drop back to the top of the page.
 */
const RemoveButton = ({
  line,
  onRemove,
}: {
  line: SheetLine;
  onRemove: (id: string) => void;
}) => (
  <button
    type="button"
    data-remove
    onClick={(e) => {
      const sheet = e.currentTarget.closest<HTMLElement>("[data-sheet]");
      const all = sheet
        ? [...sheet.querySelectorAll<HTMLElement>("[data-remove]")]
        : [];
      const i = all.indexOf(e.currentTarget);
      const next = all[i + 1] ?? all[i - 1] ?? sheet;
      onRemove(line.id);
      requestAnimationFrame(() => next?.focus());
    }}
    aria-label={`remove ${lineLabel(line)}`}
    style={{
      width: 32,
      height: 32,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      fontFamily: "var(--serif)",
      fontSize: 15,
      color: "var(--ink-faint)",
    }}
  >
    ×
  </button>
);

/* the ruled line sheet — piece · size · qty, then the total */
export function LineTable({
  lines,
  onRemove,
}: {
  lines: readonly SheetLine[];
  onRemove?: (id: string) => void;
}) {
  const cols = onRemove ? "1fr 72px 44px 32px" : "1fr 90px 64px";
  return (
    <div data-sheet tabIndex={-1} aria-label="your line sheet">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 14,
          paddingBottom: 12,
          borderBottom: "1px solid var(--rule-strong)",
        }}
      >
        <SmallLabel>piece</SmallLabel>
        <SmallLabel>size</SmallLabel>
        <SmallLabel style={{ textAlign: "right" }}>qty</SmallLabel>
      </div>
      {lines.length === 0 && (
        <div
          style={{
            padding: "18px 0",
            borderBottom: "1px solid var(--rule-soft)",
            fontSize: 15,
            color: "var(--ink-faint)",
          }}
        >
          nothing yet — choose a piece to start your line sheet.
        </div>
      )}
      {lines.map((l) => (
        <div
          key={l.id}
          style={{
            display: "grid",
            gridTemplateColumns: cols,
            gap: 14,
            padding: "16px 0",
            borderBottom: "1px solid var(--rule-soft)",
            alignItems: "baseline",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18 }}>{CAT[l.type].label}</div>
            {l.description && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  overflowWrap: "anywhere",
                }}
              >
                {l.description}
              </div>
            )}
          </div>
          <div style={{ fontSize: 15, color: "var(--ink-soft)" }}>
            {l.size ? sizeLabel(l.size) : "—"}
          </div>
          <div
            style={{
              fontSize: 18,
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {l.quantity}
          </div>
          {onRemove && <RemoveButton line={l} onRemove={onRemove} />}
        </div>
      ))}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 64px",
          gap: 14,
          paddingTop: 16,
          alignItems: "baseline",
        }}
      >
        <SmallLabel color="var(--ink)">pieces in all</SmallLabel>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {countPieces(lines)}
        </div>
      </div>
    </div>
  );
}

/* compact lines for the phone cart — qty · piece · note · remove */
function CartLines({
  lines,
  onRemove,
}: {
  lines: readonly SheetLine[];
  onRemove: (id: string) => void;
}) {
  if (lines.length === 0) {
    return (
      <div style={{ fontSize: 14, color: "var(--ink-faint)" }}>
        nothing yet — choose a piece below.
      </div>
    );
  }
  return (
    <div data-sheet tabIndex={-1} aria-label="your line sheet">
      {lines.map((l, i) => (
        <div
          key={l.id}
          style={{
            display: "grid",
            gridTemplateColumns: "30px 1fr auto",
            gap: 12,
            alignItems: "baseline",
            padding: "11px 0",
            borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)",
          }}
        >
          <span style={{ fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
            {String(l.quantity).padStart(2, "0")}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15 }}>{lineLabel(l)}</div>
            {l.description && (
              <div
                style={{
                  marginTop: 3,
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  lineHeight: 1.45,
                  overflowWrap: "anywhere",
                }}
              >
                {l.description}
              </div>
            )}
          </div>
          <RemoveButton line={l} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

/* the phone mini-cart — a quiet bar that drops open into the line sheet */
export function OrderCart({
  lines,
  onRemove,
}: {
  lines: readonly SheetLine[];
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const count = countPieces(lines);
  return (
    <div
      style={{ position: "relative", zIndex: 5 }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <button
        ref={toggle}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          textAlign: "left",
          padding: "14px 0",
          background: "none",
          cursor: "pointer",
          border: "none",
          borderTop: "1px solid var(--rule-strong)",
          borderBottom: `1px solid ${open ? "transparent" : "var(--rule-soft)"}`,
          fontFamily: "var(--serif)",
          color: "var(--ink)",
        }}
      >
        <span style={{ display: "flex", alignItems: "baseline", gap: 13 }}>
          <SmallLabel color="var(--ink)">your line sheet</SmallLabel>
          <span style={{ fontSize: 16, whiteSpace: "nowrap" }}>
            {count} pieces
          </span>
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{ borderBottom: "1px solid var(--ink)", paddingBottom: 3 }}
          >
            {open ? "hide" : "view"}
          </span>
          <span
            aria-hidden
            style={{
              fontSize: 13,
              display: "inline-block",
              transform: open ? "rotate(180deg)" : "none",
            }}
          >
            ⌄
          </span>
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            background: "var(--paper)",
            border: "1px solid var(--rule-strong)",
            boxShadow: "0 22px 48px rgba(36,35,34,0.14)",
            padding: "16px 18px 20px",
          }}
        >
          <CartLines lines={lines} onRemove={onRemove} />
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--rule-strong)",
            }}
          >
            <MinMeter count={count} />
            <div
              style={{
                marginTop: 10,
                fontSize: 12.5,
                color: "var(--ink-faint)",
              }}
            >
              tap × to remove a line
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
