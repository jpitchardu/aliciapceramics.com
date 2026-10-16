import type { Metadata } from "next";
import { track } from "@vercel/analytics/server";
import { Sig } from "@/ui/Sig";
import { STUDIO, whenLabel } from "@/lib/classes";
import { getClass } from "@/lib/classes-square";
import { Facts, Label, QuietLink } from "../../_components/bits";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "you're booked — alicia p. ceramics",
};

/* where square sends people after paying for a class */
export default async function BookedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const e = await getClass((await params).id);
  await track("class_booked").catch(() => {});

  return (
    <div
      className="cl-wrap"
      style={{ maxWidth: 620, textAlign: "center", paddingBottom: 10 }}
    >
      <Label>you&apos;re booked</Label>
      <h1
        className="cl-title-xl"
        style={{
          margin: "16px 0 0",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
        }}
      >
        {e
          ? `thank you — see you ${whenLabel(e.sessions[0])}.`
          : "thank you — see you soon."}
      </h1>
      <p
        style={{
          margin: "18px auto 0",
          maxWidth: 430,
          fontSize: 16,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
        }}
      >
        your receipt comes from square. if anything changes before the class,
        i&apos;ll email you.
      </p>

      {e && (
        <Facts
          style={{
            margin: "32px auto 0",
            maxWidth: 460,
            textAlign: "left",
            borderTop: "1px solid var(--rule-strong)",
            borderBottom: "1px solid var(--rule-strong)",
          }}
          rows={[
            ["class", e.title],
            [
              "when",
              e.sessions
                .map((s) => `${whenLabel(s)} · ${s.time}`)
                .join(" and "),
            ],
            ["where", STUDIO],
          ]}
        />
      )}

      <div style={{ marginTop: 32 }}>
        <QuietLink href="/classes">see what else is on →</QuietLink>
      </div>
      <Sig size={30} style={{ marginTop: 30 }}>
        — a.
      </Sig>
    </div>
  );
}
