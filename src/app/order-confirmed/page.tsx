import Link from "next/link";
import { Logo } from "@/ui/Logo";
import { Sig } from "@/ui/Sig";
import { CeramicLabel } from "@/ui/CeramicLabel";

export default function OrderConfirmedPage() {
  return (
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 24px",
        textAlign: "center",
      }}
    >
      <Link href="/">
        <Logo width={140} />
      </Link>

      <div
        style={{
          marginTop: 48,
          fontFamily: "var(--serif)",
          fontSize: 38,
          fontStyle: "italic",
          fontWeight: 300,
          lineHeight: 1.1,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
          maxWidth: 560,
        }}
      >
        it&apos;s on its way.
      </div>

      <p
        style={{
          marginTop: 24,
          fontFamily: "var(--serif)",
          fontSize: 18,
          fontStyle: "italic",
          fontWeight: 300,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
          maxWidth: 440,
          margin: "24px auto 0",
        }}
      >
        thank you. I&apos;ll have your piece packed and posted the morning
        after. you&apos;ll hear from me when it&apos;s on its way.
      </p>

      <Sig
        size={36}
        color="var(--ink)"
        style={{ marginTop: 36, display: "inline-block" }}
      >
        — alicia
      </Sig>

      <div style={{ marginTop: 56 }}>
        <Link href="/shop" className="ds-action">
          back to the shop
        </Link>
      </div>

      <div
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid var(--rule-soft)",
          width: "100%",
          maxWidth: 480,
        }}
      >
        <CeramicLabel color="var(--ink-faint)">
          aliciapceramics · brooklyn
        </CeramicLabel>
      </div>
    </div>
  );
}
