"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CeramicLabel } from "@/ui/CeramicLabel";
import type { Category } from "@/lib/square";

interface ShopFiltersProps {
  categories: Category[];
}

export function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("cat") ?? "all";
  const [open, setOpen] = useState(false);

  const all = [{ id: "all", name: "all" }, ...categories];

  function navigate(id: string) {
    const url = id === "all" ? "/shop" : `/shop?cat=${id}`;
    router.push(url);
    setOpen(false);
  }

  const activeLabel = all.find((c) => c.id === active)?.name ?? "all";

  return (
    <>
      {/* ── Mobile filter button ───────────────────────── */}
      <div
        className="lg:hidden"
        style={{ padding: "0 16px 16px", position: "relative" }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: "none",
            border: "1px solid var(--rule-strong)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <CeramicLabel color="var(--ink)">filter: {activeLabel}</CeramicLabel>
          <CeramicLabel color="var(--ink-faint)">
            {open ? "▲" : "▼"}
          </CeramicLabel>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 16,
              right: 16,
              background: "var(--paper)",
              border: "1px solid var(--rule-strong)",
              borderTop: "none",
              zIndex: 50,
            }}
          >
            {all.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(cat.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--rule-soft)",
                  cursor: "pointer",
                }}
              >
                <CeramicLabel
                  color={cat.id === active ? "var(--ink)" : "var(--ink-faint)"}
                >
                  {cat.name}
                </CeramicLabel>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop tab row ───────────────────────────── */}
      <div className="hidden lg:flex" style={{ gap: 26 }}>
        {all.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(cat.id)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              borderBottom: cat.id === active ? "1px solid var(--ink)" : "none",
              paddingBottom: cat.id === active ? 4 : 0,
            }}
          >
            <CeramicLabel
              color={cat.id === active ? "var(--ink)" : "var(--ink-faint)"}
            >
              {cat.name}
            </CeramicLabel>
          </button>
        ))}
      </div>
    </>
  );
}
