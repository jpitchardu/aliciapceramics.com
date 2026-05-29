"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CeramicLabel } from "@/ui/CeramicLabel";
import { Sig } from "@/ui/Sig";

interface CountdownProps {
  opensAt: string;
  dropName: string;
  dropSubtitle: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, done: diff <= 0 };
}

export function Countdown({ opensAt, dropName, dropSubtitle }: CountdownProps) {
  const target = new Date(opensAt).getTime();
  const [time, setTime] = useState(getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

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
      <CeramicLabel color="var(--ink-faint)">{dropName}</CeramicLabel>

      <p
        style={{
          marginTop: 20,
          fontSize: "clamp(17px, 2.5vw, 22px)",
          fontStyle: "italic",
          fontWeight: 300,
          color: "var(--ink-soft)",
          lineHeight: 1.4,
          maxWidth: 480,
          letterSpacing: "-0.005em",
        }}
      >
        {dropSubtitle}
      </p>

      {time.done ? (
        <div style={{ marginTop: 64 }}>
          <p
            style={{
              fontSize: "clamp(18px, 2vw, 22px)",
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink-soft)",
              marginBottom: 32,
            }}
          >
            the shop is open.
          </p>
          <Link href="/shop" className="ds-action">
            enter the shop →
          </Link>
        </div>
      ) : (
        <>
          <div
            style={{
              marginTop: 56,
              display: "flex",
              gap: "clamp(24px, 5vw, 64px)",
              alignItems: "baseline",
            }}
          >
            {[
              { value: pad(time.hours), label: "hours" },
              { value: pad(time.minutes), label: "minutes" },
              { value: pad(time.seconds), label: "seconds" },
            ].map(({ value, label }, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(52px, 10vw, 120px)",
                    fontWeight: 300,
                    fontStyle: "italic",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: "var(--ink)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {value}
                </span>
                <CeramicLabel color="var(--ink-faint)">{label}</CeramicLabel>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: 48,
              fontSize: 14,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--ink-faint)",
              letterSpacing: "0.01em",
            }}
          >
            opens tomorrow at 9am — set a reminder.
          </p>
        </>
      )}

      <Sig size={26} color="var(--ink-soft)" style={{ marginTop: 64 }}>
        a.
      </Sig>
    </div>
  );
}
