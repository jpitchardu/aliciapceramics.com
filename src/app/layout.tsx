import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/ui/cart/CartContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "alicia p. ceramics",
  description:
    "handmade ceramics by alicia p. — made of earth, full of His spirit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Coming+Soon&family=Just+Me+Again+Down+Here&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
