"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/ui/cart/CartContext";
import { Photo } from "@/ui/Photo";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Sig } from "@/ui/Sig";
import { SITE, PICKUP_SLOTS } from "@/lib/config";

const TIME_SLOTS = PICKUP_SLOTS;

function RadioDot({ active }: { active: boolean }) {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 999,
        border: active ? "1px solid var(--ink)" : "1px solid var(--ink-soft)",
        display: "inline-block",
        position: "relative",
        flexShrink: 0,
        marginTop: 3,
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            inset: 3,
            background: "var(--ink)",
            borderRadius: 999,
          }}
        />
      )}
    </span>
  );
}

export function CartClient() {
  const { items, removeItem, total } = useCart();

  const [delivery, setDelivery] = useState<"ship" | "pickup">("pickup");
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const shipping = delivery === "ship" ? 18 : 0;
  const orderTotal = total + shipping;

  async function handleCheckout() {
    setProcessing(true);
    setError("");

    const slot = delivery === "pickup" ? TIME_SLOTS[selectedSlot] : null;
    const pickupSlot = slot
      ? `${slot.day} ${slot.date} ${slot.window}`
      : undefined;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.piece.id,
            quantity: i.quantity,
          })),
          note,
          delivery,
          pickupSlot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "something went wrong.");
        setProcessing(false);
        return;
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError("something went wrong. please try again.");
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--ink-soft)",
          }}
        >
          your cart is empty.
        </p>
        <div style={{ marginTop: 32 }}>
          <Link href="/shop" className="ds-action">
            back to the shop
          </Link>
        </div>
      </div>
    );
  }

  // ── Shared sub-components ────────────────────────────────────────────────

  const itemsList = (
    <div style={{ paddingTop: 18, borderTop: "1px solid var(--rule-strong)" }}>
      {items.map((item, i) => (
        <div
          key={item.piece.id}
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr auto 24px",
            gap: 20,
            alignItems: "start",
            padding: "24px 0",
            borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)",
          }}
        >
          <Photo ratio="4 / 5" src={item.piece.src} />
          <div style={{ paddingTop: 2 }}>
            <CeramicLabel color="var(--ink-faint)">
              no. {item.piece.n}
            </CeramicLabel>
            <div
              style={{
                marginTop: 8,
                fontFamily: "var(--serif)",
                fontSize: 20,
                fontStyle: "italic",
                fontWeight: 300,
                lineHeight: 1.1,
                color: "var(--ink)",
                letterSpacing: "-0.005em",
              }}
            >
              {item.piece.title}.
            </div>
            {item.piece.glaze && (
              <div
                style={{
                  marginTop: 6,
                  fontFamily: "var(--serif)",
                  fontSize: 13,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "var(--ink-soft)",
                }}
              >
                {item.piece.glaze}
              </div>
            )}
          </div>
          <div
            style={{
              paddingTop: 4,
              fontFamily: "var(--serif)",
              fontSize: 18,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink)",
            }}
          >
            ${item.piece.price}
          </div>
          <button
            onClick={() => removeItem(item.piece.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginTop: 8,
              fontFamily: "var(--serif)",
              fontSize: 16,
              lineHeight: 1,
              color: "var(--ink-faint)",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  const summaryPanel = (
    <div style={{ paddingTop: 18, borderTop: "1px solid var(--rule-strong)" }}>
      <CeramicLabel color="var(--ink-faint)">order</CeramicLabel>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 15,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink-soft)",
            }}
          >
            subtotal · {items.length} {items.length === 1 ? "piece" : "pieces"}
          </span>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 15,
              fontWeight: 300,
              color: "var(--ink)",
            }}
          >
            ${total}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 15,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink-soft)",
            }}
          >
            tax
          </span>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 14,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink-faint)",
            }}
          >
            at checkout
          </span>
        </div>
      </div>

      {/* delivery */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid var(--rule-soft)",
        }}
      >
        <CeramicLabel color="var(--ink-faint)">delivery</CeramicLabel>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              cursor: "pointer",
            }}
            onClick={() => setDelivery("ship")}
          >
            <RadioDot active={delivery === "ship"} />
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 16,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: delivery === "ship" ? "var(--ink)" : "var(--ink-soft)",
                }}
              >
                ship to me
              </span>
              <div
                style={{
                  marginTop: 3,
                  fontFamily: "var(--serif)",
                  fontSize: 13,
                  color: "var(--ink-faint)",
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                packed by hand with care
              </div>
            </div>
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: 15,
                fontWeight: 300,
                color: "var(--ink-soft)",
                flexShrink: 0,
              }}
            >
              $18
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              cursor: "pointer",
            }}
            onClick={() => setDelivery("pickup")}
          >
            <RadioDot active={delivery === "pickup"} />
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 16,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color:
                    delivery === "pickup" ? "var(--ink)" : "var(--ink-soft)",
                }}
              >
                pick up in studio
              </span>
              <div
                style={{
                  marginTop: 3,
                  fontFamily: "var(--serif)",
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                {SITE.studio.address}
              </div>

              {delivery === "pickup" && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px dashed rgba(36,35,34,0.25)",
                  }}
                >
                  <CeramicLabel
                    color="var(--ink-faint)"
                    style={{ fontSize: 9 }}
                  >
                    pick a time
                  </CeramicLabel>
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {TIME_SLOTS.map((s, idx) => (
                      <div
                        key={s.date}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "14px 36px 1fr auto",
                          gap: 10,
                          alignItems: "baseline",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlot(idx);
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            border:
                              selectedSlot === idx
                                ? "1px solid var(--ink)"
                                : "1px solid var(--ink-faint)",
                            background:
                              selectedSlot === idx
                                ? "var(--ink)"
                                : "transparent",
                            display: "inline-block",
                            marginTop: 4,
                          }}
                        />
                        <CeramicLabel
                          color={
                            selectedSlot === idx
                              ? "var(--ink)"
                              : "var(--ink-soft)"
                          }
                          style={{ fontSize: 10 }}
                        >
                          {s.day}
                        </CeramicLabel>
                        <span
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: 14,
                            fontStyle: "italic",
                            fontWeight: 300,
                            color:
                              selectedSlot === idx
                                ? "var(--ink)"
                                : "var(--ink-soft)",
                          }}
                        >
                          {s.date}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: 13,
                            fontWeight: 300,
                            color:
                              selectedSlot === idx
                                ? "var(--ink)"
                                : "var(--ink-faint)",
                          }}
                        >
                          {s.window}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: 14,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--ink-soft)",
                flexShrink: 0,
              }}
            >
              free
            </span>
          </div>
        </div>
      </div>

      {/* total */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid var(--rule-soft)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <CeramicLabel color="var(--ink)">total</CeramicLabel>
        <span
          style={{
            fontFamily: "var(--serif)",
            fontSize: 32,
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--ink)",
            letterSpacing: "-0.005em",
          }}
        >
          ${orderTotal}
        </span>
      </div>

      {/* note for alicia */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid var(--rule-soft)",
        }}
      >
        <CeramicLabel color="var(--ink-faint)">
          a note for alicia (optional)
        </CeramicLabel>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="say hello, or tell me who this is for..."
          style={{
            display: "block",
            width: "100%",
            marginTop: 12,
            fontFamily: "var(--serif)",
            fontSize: 15,
            fontStyle: "italic",
            color: "var(--ink)",
            fontWeight: 300,
            lineHeight: 1.5,
            borderBottom: "1px solid rgba(36,35,34,0.25)",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            background: "transparent",
            padding: "0 0 18px",
            minHeight: 60,
            resize: "none",
            outline: "none",
          }}
        />
      </div>

      {error && (
        <p
          style={{
            marginTop: 12,
            fontFamily: "var(--serif)",
            fontSize: 13,
            color: "var(--topaze)",
            fontStyle: "italic",
          }}
        >
          {error}
        </p>
      )}

      <button
        className="ds-checkout-btn"
        style={{ marginTop: 20 }}
        onClick={handleCheckout}
        disabled={processing}
      >
        {processing ? "redirecting…" : "check out"}
      </button>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── MOBILE ───────────────────────────────────────────────── */}
      <div className="lg:hidden" style={{ padding: "0 20px" }}>
        <div style={{ marginBottom: 32 }}>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 26,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink)",
            }}
          >
            your cart
          </span>
        </div>
        {itemsList}
        <div style={{ marginTop: 40 }}>{summaryPanel}</div>
      </div>

      {/* ── DESKTOP ──────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {/* breadcrumb */}
        <div
          style={{
            padding: "32px 56px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Link href="/shop" style={{ textDecoration: "none" }}>
            <CeramicLabel color="var(--ink-soft)">← keep looking</CeramicLabel>
          </Link>
          <CeramicLabel color="var(--ink-faint)">
            {items.length} {items.length === 1 ? "piece" : "pieces"}
          </CeramicLabel>
        </div>

        {/* title */}
        <div style={{ padding: "0 56px", textAlign: "center" }}>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 28,
              fontWeight: 300,
              letterSpacing: "0.6em",
              textTransform: "uppercase",
              color: "var(--ink)",
            }}
          >
            your cart
          </span>
          <p
            style={{
              marginTop: 22,
              fontFamily: "var(--serif)",
              fontSize: 19,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink-soft)",
              lineHeight: 1.4,
              margin: "22px auto 0",
              maxWidth: 560,
              letterSpacing: "-0.005em",
            }}
          >
            each piece is one of a kind. once it leaves, the line stays and the
            price is drawn through.
          </p>
        </div>

        {/* body — 2-col */}
        <div
          style={{
            margin: "64px 56px 0",
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 80,
            alignItems: "start",
          }}
        >
          {itemsList}
          {summaryPanel}
        </div>

        <div
          style={{
            margin: "80px 56px 0",
            paddingTop: 26,
            paddingBottom: 48,
            borderTop: "1px solid var(--rule-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <CeramicLabel color="var(--ink-faint)">
            {SITE.name} · est. {SITE.estYear}
          </CeramicLabel>
          <Sig size={26} color="var(--ink-soft)">
            AP
          </Sig>
        </div>
      </div>
    </>
  );
}
