"use client";

import { FormEvent, ReactNode, useState, type CSSProperties } from "react";
import { z } from "zod";
import { Field, FillButton } from "../../_components/atoms";

const email = z.email();

/*
 * "Tell me when the next class goes up" — one email field. Lives on a
 * sold-out class (where people land after the last seat goes) and on the
 * classes page. Signups go to Square's "class list" customer group.
 */
export function ClassListSignup({
  from,
  title = "hear about the next class.",
  children = "new dates fill fast. leave your email and i'll let you know the moment the next one goes up.",
  style,
}: {
  /* where they signed up — a class id, or "classes" for the list */
  from: string;
  title?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const [submissionId] = useState(() => crypto.randomUUID());
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const address = value.trim();
    if (!email.safeParse(address).success) {
      setError("that email doesn't look right");
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      const res = await fetch("/api/classes/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, email: address, from }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
    } catch {
      setError("something went wrong saving that — give it another try.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="cl-list-signup"
      style={{
        border: "1px solid var(--rule-strong)",
        padding: "26px 24px",
        textAlign: "left",
        ...style,
      }}
    >
      {done ? (
        <div role="status">
          <h2 style={heading}>you&apos;re on the list.</h2>
          <p style={body}>
            i&apos;ll email you when the next class goes up. see you in the
            studio.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <h2 style={heading}>{title}</h2>
          <p style={body}>{children}</p>
          <div style={{ marginTop: 20 }}>
            <Field
              label="your email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={value}
              onChange={(v) => {
                setValue(v);
                if (error) setError(undefined);
              }}
              error={error}
            />
          </div>
          <FillButton
            type="submit"
            disabled={busy}
            style={{ marginTop: 20, width: "100%", padding: "15px 20px" }}
          >
            {busy ? "saving…" : "let me know"}
          </FillButton>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 12,
              color: "var(--ink-soft)",
              lineHeight: 1.5,
            }}
          >
            just class news, nothing else. unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}

const heading: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 24,
  fontWeight: 400,
  lineHeight: 1.2,
};

const body: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "var(--ink-soft)",
  lineHeight: 1.6,
};
