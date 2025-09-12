import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/ui/Footer";

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
      <body className="antialiased h-screen overflow-hidden">
        <div className="h-full flex flex-col">
          <main className="flex-1 min-h-0">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
