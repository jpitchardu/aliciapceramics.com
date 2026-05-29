import { CSSProperties } from "react";

export function Star({
  size = 14,
  color = "currentColor",
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        display: "inline-block",
        flexShrink: 0,
        verticalAlign: "middle",
        ...style,
      }}
      aria-hidden="true"
    >
      <path
        d="M50 6 L55 45 L94 50 L55 55 L50 94 L45 55 L6 50 L45 45 Z"
        fill={color}
      />
    </svg>
  );
}
