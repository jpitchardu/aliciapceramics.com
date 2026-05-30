"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/ui/Logo";
import { CeramicLabel } from "@/ui/CeramicLabel";

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        style={{
          padding: "20px 24px 18px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 5,
            width: 24,
          }}
        >
          <span
            style={{
              display: "block",
              width: 24,
              height: 1,
              background: "var(--ink-soft)",
            }}
          />
          <span
            style={{
              display: "block",
              width: 16,
              height: 1,
              background: "var(--ink-soft)",
            }}
          />
          <span
            style={{
              display: "block",
              width: 20,
              height: 1,
              background: "var(--ink-soft)",
            }}
          />
        </button>

        <Link href="/">
          <Logo width={108} />
        </Link>

        <Link
          href="/cart"
          style={{ textDecoration: "none", justifySelf: "end" }}
        >
          <CeramicLabel color="var(--ink-soft)">cart</CeramicLabel>
        </Link>
      </div>

      {open && (
        <div
          style={{
            padding: "8px 24px 24px",
            borderBottom: "1px solid var(--rule-strong)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            style={{ textDecoration: "none" }}
          >
            <CeramicLabel color="var(--ink-soft)">shop</CeramicLabel>
          </Link>
        </div>
      )}
    </div>
  );
}
