import { CeramicLabel } from "@/ui/CeramicLabel";
import { Sig } from "@/ui/Sig";
import { SITE } from "@/lib/config";

/*
 * Shown on the home page while SHOP_CLOSED is on — the shop, cart and
 * confirmation routes redirect here (see middleware). Mirrors the countdown
 * page's layout so the two gates feel like the same room.
 */
export function ShopClosed() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 28px",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
      }}
    >
      <CeramicLabel color="var(--ink-faint)">alicia p ceramics</CeramicLabel>

      <h1
        style={{
          marginTop: 28,
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          color: "var(--ink)",
        }}
      >
        exciting things coming.
      </h1>

      <p
        style={{
          marginTop: 20,
          fontSize: "clamp(17px, 2.5vw, 22px)",
          fontWeight: 400,
          color: "var(--ink-soft)",
          lineHeight: 1.4,
          maxWidth: 480,
        }}
      >
        the shop is closed while i work on something new. follow along on
        instagram for updates.
      </p>

      <a
        href={`https://instagram.com/${SITE.instagram}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ds-action"
        style={{ marginTop: 48 }}
      >
        @{SITE.instagram} →
      </a>

      <Sig size={36} color="var(--ink-soft)" style={{ marginTop: 64 }}>
        AP
      </Sig>
    </div>
  );
}
