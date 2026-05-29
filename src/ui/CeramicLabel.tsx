import { CSSProperties, ReactNode } from "react";

interface CeramicLabelProps {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}

export function CeramicLabel({
  children,
  color = "var(--ink-soft)",
  style,
}: CeramicLabelProps) {
  return (
    <span
      style={{
        fontFamily: "var(--serif)",
        fontSize: 11,
        fontWeight: 400,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
