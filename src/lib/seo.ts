// SEO structured data (schema.org JSON-LD).
//
// Pure builder functions return plain JSON-LD objects so they can be embedded
// in the server-rendered HTML of async server components — search engines and
// rich-result tools can then crawl the storefront. The <JsonLd> component just
// serialises whatever object(s) it is handed into a <script> tag.
//
// This is a server module (no "use client"): the helpers run during SSR and the
// resulting markup lands in the initial HTML response.

import { createElement } from "react";
import type { StoreProduct } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const SCHEMA_CONTEXT = "https://schema.org";
const BRAND_NAME = "PATHOS by Yeralis";
const BRAND_EMAIL = "hello@pathos-yeralis.gr";
const BRAND_DESCRIPTION =
  "An Athens atelier crafting handmade jewelry from Aegean gemstones, shells and minerals.";

// Turn a possibly-relative image/URL path into an absolute one.
function absolute(u: string): string {
  if (u.startsWith("http")) return u;
  return SITE_URL + (u.startsWith("/") ? u : "/" + u);
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    email: BRAND_EMAIL,
    description: BRAND_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Adrianou 24, Pláka",
      addressLocality: "Athens",
      postalCode: "10556",
      addressCountry: "GR",
    },
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
  };
}

export function productJsonLd(p: StoreProduct, url: string): Record<string, unknown> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Product",
    name: p.name,
    sku: p.id,
    category: p.collection,
    brand: { "@type": "Brand", name: BRAND_NAME },
    ...(p.desc ? { description: p.desc } : {}),
    ...(p.imageUrl ? { image: absolute(p.imageUrl) } : {}),
    offers: {
      "@type": "Offer",
      price: p.price.toFixed(2),
      priceCurrency: "EUR",
      availability:
        p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    },
  };
}

export function itemListJsonLd(
  products: StoreProduct[],
  baseUrl: string,
): Record<string, unknown> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    itemListElement: products.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: productJsonLd(p, baseUrl),
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// Authored with createElement rather than JSX so this stays a `.ts` module
// (the repo reserves `.tsx` for JSX); the output is an identical <script> tag.
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}
