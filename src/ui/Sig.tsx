import { CSSProperties, ReactNode } from "react";

interface SigProps {
  children: ReactNode;
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export function Sig({
  children,
  size = 18,
  color = "var(--ink-soft)",
  style,
}: SigProps) {
  return (
    <span
      style={{
        fontFamily: "var(--hand)",
        fontSize: size,
        fontWeight: 400,
        color,
        lineHeight: 1,
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
