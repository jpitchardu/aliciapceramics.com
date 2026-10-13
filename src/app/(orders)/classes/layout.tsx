import type { Metadata } from "next";
import { OrderHeader } from "../_components/OrderHeader";
import { OrderFooter } from "../_components/OrderFooter";
import "../orders.css";
import "./classes.css";

export const metadata: Metadata = {
  title: "classes — alicia p. ceramics",
  description: "classes and private events at the studio in dallas.",
  // a preview: not linked from the site and kept out of search
  robots: { index: false },
};

export default function ClassesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ws-page">
      <OrderHeader label="book" />
      <p className="cl-preview">
        preview — these are sample classes. nothing here is charged or sent
        anywhere yet.
      </p>
      <main>{children}</main>
      <OrderFooter label="classes at the studio" />
    </div>
  );
}
