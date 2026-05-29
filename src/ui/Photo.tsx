import { CSSProperties } from "react";
import Image from "next/image";

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
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
