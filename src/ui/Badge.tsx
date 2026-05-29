import { PieceState } from "@/types/piece";

interface BadgeProps {
  state: PieceState;
  compact?: boolean;
}

const META: Record<PieceState, { dot: string; text: string; ink: string }> = {
  here: { dot: "var(--sauge)", text: "still here", ink: "var(--ink)" },
  held: { dot: "var(--topaze)", text: "held · 14m", ink: "var(--ink)" },
  gone: { dot: "var(--ink-faint)", text: "taken", ink: "var(--ink-soft)" },
};

export function Badge({ state, compact = false }: BadgeProps) {
  const meta = META[state];
  return (
    <div
      style={{
        position: "absolute",
        top: compact ? 8 : 14,
        left: compact ? 8 : 14,
        zIndex: 2,
        background: "var(--paper)",
        padding: compact ? "4px 7px 4px 6px" : "6px 10px 6px 9px",
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 5 : 7,
        fontFamily: "var(--serif)",
        fontSize: compact ? 8 : 10,
        fontWeight: 400,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: meta.ink,
      }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: meta.dot,
          display: "inline-block",
        }}
      />
      {meta.text}
    </div>
  );
}
