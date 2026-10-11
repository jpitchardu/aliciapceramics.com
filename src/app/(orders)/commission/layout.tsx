import type { Metadata } from "next";
import { OrderHeader } from "../_components/OrderHeader";
import { OrderFooter } from "../_components/OrderFooter";
import "../orders.css";

export const metadata: Metadata = {
  // the first step's title; the flow retitles the tab as it moves on
  title: "your code — commissions — alicia p. ceramics",
  description: "small commissions — handmade by alicia p. in dallas.",
  robots: { index: false },
};

export default function CommissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ws-page">
      <OrderHeader label="commission" />
      <main>{children}</main>
      <OrderFooter label="for small commissions" />
    </div>
  );
}
