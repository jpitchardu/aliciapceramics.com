import { CeramicLabel } from "@/ui/CeramicLabel";
import { Sig } from "@/ui/Sig";
import { SITE } from "@/lib/config";

export function WholesaleFooter() {
  return (
    <footer className="ws-footer">
      <div>
        <CeramicLabel color="var(--ink-faint)">
          {SITE.name} · for wholesale/bulk orders
        </CeramicLabel>
        <div style={{ marginTop: 10, fontSize: 14, color: "var(--ink-soft)" }}>
          the studio is at {SITE.studio.address.split(",")[0]} —{" "}
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
      <Sig size={36}>AP</Sig>
    </footer>
  );
}
