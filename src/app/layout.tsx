import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DESCRIPTION =
  "Handmade jewelry from the Aegean — gemstones, shells and minerals shaped into pieces made to last a lifetime.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PATHOS · by Yeralis",
  description: DESCRIPTION,
  openGraph: {
    title: "PATHOS by Yeralis",
    description: DESCRIPTION,
    type: "website",
    siteName: "PATHOS by Yeralis",
  },
  twitter: { card: "summary_large_image", title: "PATHOS by Yeralis", description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f0e6" },
    { media: "(prefers-color-scheme: dark)", color: "#2a241e" },
  ],
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
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
