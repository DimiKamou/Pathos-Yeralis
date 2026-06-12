import type { Metadata } from "next";
import { Newsreader, Mulish } from "next/font/google";
import "./globals.css";

// Display: Newsreader — a light, screen-native editorial serif with a graceful
// italic. Set large and airy, it carries the minimalist register without the
// decoration of the original's Cormorant.
const display = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// UI: Mulish — a quiet, low-contrast sans that disappears at small sizes.
const ui = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PATHOS by Yeralis — handmade jewelry from the Aegean",
  description:
    "Quiet, handmade Greek jewelry. Gemstones, shells and minerals from the Aegean, made by hand in Athens.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable}`}>
      <body className="font-ui antialiased">{children}</body>
    </html>
  );
}
