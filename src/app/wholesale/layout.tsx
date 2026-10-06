import type { Metadata } from "next";
import { WholesaleHeader } from "./_components/WholesaleHeader";
import { WholesaleFooter } from "./_components/WholesaleFooter";
import "./wholesale.css";

export const metadata: Metadata = {
  title: "bulk orders — alicia p. ceramics",
  description:
    "bulk orders for shops, cafés and stockists — handmade by alicia p. in dallas.",
  robots: { index: false },
};

export default function WholesaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ws-page">
      <WholesaleHeader />
      <main>{children}</main>
      <WholesaleFooter />
    </div>
  );
}
