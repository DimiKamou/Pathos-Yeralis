import type { Metadata } from "next";
import { Alegreya, Manrope } from "next/font/google";
import "./globals.css";

// Display: Alegreya — calligraphic, high-contrast, and (crucially) ships a
// proper Greek glyph set so ΠΑΘΟΣ / ΕΡΩΣ render authentically. Deliberately
// not the Cormorant/Playfair we'd reach for on any other jewelry brief.
const display = Alegreya({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// UI: Manrope — a quiet humanist grotesque for labels, prices, and body.
const ui = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ΠΑΘΟΣ by Yeralis — jewelry for the feelings that don't have words",
  description:
    "Handmade Greek jewelry, arranged not by category but by feeling. Gemstones, shells and minerals from the Aegean, struck by hand.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable}`}>
      <body className="font-ui antialiased">{children}</body>
    </html>
  );
}
