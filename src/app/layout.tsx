import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: "KĀYA — Hand-loomed journals with a solid brass spine", template: "%s · KĀYA" },
  description:
    "Refillable cotton-rag journals with a solid brass spine and covers hand-loomed by craft clusters across India. Change the cover when your week changes.",
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable} ${caveat.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
