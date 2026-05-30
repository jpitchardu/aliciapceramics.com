import { CSSProperties } from "react";
import Image from "next/image";

interface PhotoProps {
  src?: string;
  ratio?: string;
  style?: CSSProperties;
  rotate?: 90 | -90 | 180;
  sizes?: string;
}

export function Photo({
  src = "/assets/photo-placeholder.png",
  ratio = "4 / 5",
  style,
  rotate,
  sizes = "(max-width: 1024px) 50vw, 33vw",
}: PhotoProps) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: ratio,
        position: "relative",
        display: "block",
        overflow: "hidden",
        ...style,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        style={{
          objectFit: "cover",
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
        }}
      />
    </div>
  );
}
