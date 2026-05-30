import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/ui/cart/CartContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "alicia p. ceramics",
  description: "handmade ceramics by alicia p. — revelations of creation.",
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Caveat:wght@400&display=swap"
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
