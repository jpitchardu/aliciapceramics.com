"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/ui/Logo";
import { CeramicLabel } from "@/ui/CeramicLabel";

const LINKS = [
  { href: "/shop", label: "shop" },
  { href: "/care", label: "care" },
];

/* the storefront nav, with "bulk order" standing in for the cart */
export function WholesaleHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <div className="ws-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            type="button"
            className="ws-mobile-only"
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
            aria-expanded={open}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 0",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              width: 22,
            }}
          >
            {[22, 22, 18].map((w, i) => (
              <span
                key={i}
                style={{ width: w, height: 1, background: "var(--ink-soft)" }}
              />
            ))}
          </button>
          <nav
            className="ws-desktop-only"
            aria-label="site"
            style={{ gap: 36 }}
          >
            <div style={{ display: "flex", gap: 36 }}>
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{ textDecoration: "none" }}
                >
                  <CeramicLabel>{l.label}</CeramicLabel>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <Link href="/" style={{ justifySelf: "center" }}>
          <span className="ws-mobile-only">
            <Logo width={96} />
          </span>
          <span className="ws-desktop-only">
            <Logo width={200} />
          </span>
        </Link>

        <span style={{ justifySelf: "end" }}>
          <CeramicLabel
            color="var(--ink)"
            style={{ borderBottom: "1px solid var(--ink)", paddingBottom: 4 }}
          >
            bulk order
          </CeramicLabel>
        </span>
      </div>

      {open && (
        <nav
          aria-label="site"
          className="ws-mobile-only ws-pad"
          style={{
            paddingTop: 8,
            paddingBottom: 24,
            borderBottom: "1px solid var(--rule-strong)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ textDecoration: "none" }}
            >
              <CeramicLabel>{l.label}</CeramicLabel>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
