"use client";

import Link from "next/link";
import { Logo } from "@/ui/Logo";

export default function StorefrontError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
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
        something went wrong.
      </p>
      <p
        style={{
          marginTop: 12,
          fontSize: 15,
          fontStyle: "italic",
          fontWeight: 300,
          color: "var(--ink-faint)",
        }}
      >
        try again, or come back in a moment.
      </p>
      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button onClick={reset} className="ds-action">
          try again
        </button>
        <Link href="/shop" className="ds-action">
          back to the shop
        </Link>
      </div>
    </div>
  );
}
