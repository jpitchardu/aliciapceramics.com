import type { Metadata } from "next";
import Image from "next/image";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Sig } from "@/ui/Sig";

export const metadata: Metadata = {
  title: "caring for your ceramics — alicia p. ceramics",
  description:
    "how to wash, microwave and handle your pieces. all pottery is lead free and food safe unless specified.",
};

/*
 * Alicia's care copy, verbatim. Everything is centred, the section labels are
 * small uppercase and sit tight above their paragraph, and the paragraph text
 * is the largest element on the page — that inversion is what keeps the page
 * from reading flat. Don't put dividers between the sections; the spacing
 * carries the separation.
 */
const SECTIONS = [
  {
    label: "cleaning",
    body: "Handwashing is preferred but you can put your pieces in the dishwasher if needed. If you do put them in the dishwasher, Ensure that they’re spread apart so they don’t bump in to each other during the cycle because they could chip or crack.",
  },
  {
    label: "microwave?",
    body: "It’s always best to be safe but your ceramics can go in the microwave, be sure to avoid rapid temperature changes that can cause thermal shock. Example, If you’re pouring hot water in to a mug, try to warm it first!",
  },
  {
    label: "be aware of your hands!",
    body: "Ceramic mugs can be hot to the touch if hot liquid is inside so just be mindful when you’re grabbing a hot mug.",
  },
];

export default function CarePage() {
  return (
    <article
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "clamp(48px, 8vw, 104px) clamp(28px, 5vw, 56px) 0",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(30px, 5.4vw, 44px)",
          fontWeight: 700,
          letterSpacing: "0.05em",
          lineHeight: 1.15,
          textTransform: "uppercase",
        }}
      >
        caring for your ceramics
      </h1>

      <p
        style={{
          margin: "clamp(22px, 3.4vw, 30px) auto 0",
          maxWidth: "30em",
          fontSize: "clamp(14px, 1.5vw, 15px)",
          fontWeight: 400,
          lineHeight: 1.55,
          color: "var(--ink)",
        }}
      >
        everything here is hand thrown, glazed, and fired one piece at a time.
        none of it is fragile, exactly — it just likes to be handled with a
        little attention.
      </p>

      {SECTIONS.map(({ label, body }, i) => (
        <section
          key={label}
          style={{
            paddingTop: "clamp(46px, 7vw, 74px)",
            marginTop: i === 0 ? 0 : "clamp(20px, 3vw, 30px)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(19px, 2.1vw, 21px)",
              fontWeight: 700,
              letterSpacing: "0.16em",
              lineHeight: 1.3,
              textTransform: "uppercase",
              color: "var(--ink)",
            }}
          >
            {label}
          </h2>
          <p
            style={{
              margin: "10px auto 0",
              maxWidth: "30em",
              fontSize: "clamp(20px, 2.4vw, 23px)",
              fontWeight: 400,
              lineHeight: 1.7,
            }}
          >
            {body}
          </p>
        </section>
      ))}

      <div
        style={{
          marginTop: "clamp(52px, 8vw, 84px)",
          padding: "clamp(26px, 4vw, 34px) 0",
          borderTop: "1px solid var(--rule-strong)",
          borderBottom: "1px solid var(--rule-strong)",
          display: "flex",
          gap: 14,
          alignItems: "baseline",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            flex: "0 0 auto",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--sauge)",
            transform: "translateY(-4px)",
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.45,
            color: "var(--ink)",
          }}
        >
          All pottery is lead free and food safe unless specified!
        </p>
      </div>

      <div
        style={{
          marginTop: "clamp(40px, 6vw, 56px)",
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <CeramicLabel color="var(--ink-soft)">with care</CeramicLabel>
        <Sig size={42} color="var(--ink)">
          alicia
        </Sig>
      </div>

      <figure
        style={{
          margin: "clamp(56px, 8vw, 96px) auto 0",
          maxWidth: 700,
        }}
      >
        {/* natural 700×900 ratio — the design shows the pair uncropped */}
        <Image
          src="/assets/piece-pair.png"
          alt="a pair of glazed pieces"
          width={700}
          height={900}
          sizes="(max-width: 767px) 100vw, 700px"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        <figcaption style={{ marginTop: 12 }}>
          <CeramicLabel color="var(--ink-faint)">
            studio, dallas tx
          </CeramicLabel>
        </figcaption>
      </figure>
    </article>
  );
}
