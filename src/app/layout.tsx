import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aliciap Ceramics",
  description: "Handmade ceramics by Alicia P.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased max-h-full">{children}</body>
    </html>
  );
}
