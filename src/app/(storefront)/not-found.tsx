import Link from "next/link";
import { Logo } from "@/ui/Logo";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "56px 24px",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
      }}
    >
      <Link href="/">
        <Logo width={120} />
      </Link>
      <p
        style={{
          marginTop: 48,
          fontSize: 22,
          fontStyle: "italic",
          fontWeight: 300,
          color: "var(--ink-soft)",
        }}
      >
        this piece has moved on.
      </p>
      <div style={{ marginTop: 40 }}>
        <Link href="/shop" className="ds-action">
          see what&apos;s still here
        </Link>
      </div>
    </div>
  );
}
