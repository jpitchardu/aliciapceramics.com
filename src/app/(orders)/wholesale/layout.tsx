import type { Metadata } from "next";
import { OrderHeader } from "../_components/OrderHeader";
import { OrderFooter } from "../_components/OrderFooter";
import "../orders.css";

export const metadata: Metadata = {
  // the first step's title; the flow retitles the tab as it moves on
  title: "your code — bulk orders — alicia p. ceramics",
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
      <OrderHeader label="bulk order" />
      <main>{children}</main>
      <OrderFooter label="for wholesale/bulk orders" />
    </div>
  );
}
