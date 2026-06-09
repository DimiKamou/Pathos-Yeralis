import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PATHOS · by Yeralis",
  description:
    "Handmade jewelry from the Aegean — gemstones, shells and minerals shaped into pieces made to last a lifetime.",
};

// Pre-paint theme: apply saved dark mode before first paint to avoid a flash.
const themeScript = `try { if (localStorage.getItem('pathos.theme') === 'dark') document.documentElement.classList.add('dark'); } catch (e) {}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts loaded via link tags (verbatim from the prototypes) so the
            build never depends on fetching Google Fonts. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
