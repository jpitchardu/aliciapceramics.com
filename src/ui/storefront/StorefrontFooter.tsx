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
        /*
         * Spacing goes through CSS variables so a page can retune it from its
         * own scoped stylesheet — these are inline styles, which a plain
         * stylesheet rule can't override. The props remain the default.
         * The home page uses this to give the hero more of the phone screen.
         */
        marginTop: `var(--sf-footer-gap, ${topGap}px)`,
        marginLeft: pad,
        marginRight: pad,
        marginBottom: 0,
        paddingTop: "var(--sf-footer-pad-top, 26px)",
        paddingBottom: "var(--sf-footer-pad-bottom, 48px)",
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
            color: "var(--ink-soft)",
            fontWeight: 400,
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
      {/* 36, not 26: Just Me Again Down Here draws much smaller than Caveat
          did at the same point size. Matches the care page's sign-off. */}
      <Sig size={36} color="var(--ink-soft)">
        AP
      </Sig>
    </footer>
  );
}
