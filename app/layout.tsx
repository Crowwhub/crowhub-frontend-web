import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

// Cabinet Grotesk (Fontshare) — self-hosted. Used for the hero display headline.
const cabinet = localFont({
  src: [
    { path: "../fonts/cabinet-grotesk-extrabold.woff2", weight: "800", style: "normal" },
    { path: "../fonts/cabinet-grotesk-black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-cabinet",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "CrowHub — Find your people",
  description:
    "CrowHub brings real people together. Build your network, follow creators, and discover communities that matter to you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${cabinet.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-ink text-cream">{children}</body>
    </html>
  );
}
