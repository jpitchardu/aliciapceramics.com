import Image from "next/image";

export function Logo({ width = 140 }: { width?: number }) {
  return (
    <Image
      src="/assets/logo-sm.png"
      alt="alicia p. ceramics"
      width={width}
      height={Math.round(width * 0.55)}
      style={{ width, height: "auto" }}
      priority
    />
  );
}
