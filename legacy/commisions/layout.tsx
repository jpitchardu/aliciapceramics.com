"use client";
import { OrderProvider } from "@/app/commisions/_data/orderContext";

export default function CommisionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrderProvider>{children}</OrderProvider>;
}
