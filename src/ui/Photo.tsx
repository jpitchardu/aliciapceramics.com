import { CSSProperties } from "react";

interface PhotoProps {
  src?: string;
  ratio?: string;
  style?: CSSProperties;
}

export function Photo({
  src = "/assets/photo-placeholder.png",
  ratio = "4 / 5",
  style,
}: PhotoProps) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: ratio,
        background: `url(${src}) center / cover no-repeat`,
        display: "block",
        ...style,
      }}
    />
  );
}
