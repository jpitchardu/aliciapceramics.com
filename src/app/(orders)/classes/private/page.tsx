import type { Metadata } from "next";
import { BackLink } from "../_components/bits";
import { PrivateForm } from "../_components/forms";

export const metadata: Metadata = {
  title: "a private event — alicia p. ceramics",
};

/* private events, by request — `?place=yours` opens on "a place of your own" */
export default async function PrivatePage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const { place } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <div className="cl-wrap" style={{ paddingBottom: 22 }}>
        <BackLink />
      </div>
      <PrivateForm
        initialPlace={place === "yours" ? "yours" : "studio"}
        today={today}
      />
    </>
  );
}
