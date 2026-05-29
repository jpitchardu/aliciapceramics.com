import { CSSProperties } from "react";
import Image from "next/image";

interface PhotoProps {
  src?: string;
  ratio?: string;
  style?: CSSProperties;
  rotate?: 90 | -90 | 180;
}

export function Photo({
  src = "/assets/photo-placeholder.png",
  ratio = "4 / 5",
  style,
  rotate,
}: PhotoProps) {
  const [rw, rh] = (ratio ?? "4 / 5")
    .split("/")
    .map((s) => parseFloat(s.trim()));
  const scale =
    rotate === 90 || rotate === -90 ? Math.max(rw / rh, rh / rw) : 1;

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
        sizes="(max-width: 1024px) 50vw, 33vw"
        style={{
          objectFit: "cover",
          transform: rotate
            ? `rotate(${rotate}deg) scale(${scale})`
            : undefined,
        }}
      />
    </div>
  );
}
