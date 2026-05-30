import { CeramicLabel } from "@/ui/CeramicLabel";
import { Sig } from "@/ui/Sig";
import { SITE } from "@/lib/config";

interface StorefrontFooterProps {
  pad?: number;
  topGap?: number;
}

export function StorefrontFooter({
  pad = 56,
  topGap = 120,
}: StorefrontFooterProps) {
  return (
    <footer
      style={{
        margin: `${topGap}px ${pad}px 0`,
        paddingTop: 26,
        paddingBottom: 48,
        borderTop: "1px solid var(--rule-soft)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 24,
      }}
    >
      <div>
        <CeramicLabel color="var(--ink-faint)">
          {SITE.name} · est. {SITE.estYear}
        </CeramicLabel>
        <div
          style={{
            marginTop: 10,
            fontFamily: "var(--serif)",
            fontSize: 14,
            fontStyle: "italic",
            color: "var(--ink-soft)",
            fontWeight: 300,
          }}
        >
          new pieces show up first on instagram —{" "}
          <a
            href={`https://instagram.com/${SITE.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              borderBottom: "1px solid var(--ink)",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            @{SITE.instagram}
          </a>
        </div>
      </div>
      <Sig size={26} color="var(--ink-soft)">
        AP
      </Sig>
    </footer>
  );
}
