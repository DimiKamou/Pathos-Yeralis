import type { CSSProperties } from "react";
import { getStoreProducts } from "@/lib/products";
import { getAllSettings } from "@/lib/settings";
import { BANK } from "@/lib/bank";
import { effectiveSeason, SEASONS } from "@/lib/seasons";
import { StoreShell } from "@/components/storefront/StoreShell";
import { CollectionView } from "@/components/storefront/CollectionView";
import { slugify, unslug } from "@/lib/slug";
import { JsonLd, itemListJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${unslug(slug)} · PATHOS by Yeralis` };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [allProducts, settings] = await Promise.all([getStoreProducts(), getAllSettings()]);

  // Resolve a display label: prefer the admin collection list, then an actual
  // product collection, then a title-cased fallback from the slug.
  const fromMenu = settings.collections.find((c) => slugify(c) === slug);
  const fromProducts = allProducts.find((p) => slugify(p.collection) === slug)?.collection;
  const label = fromMenu || fromProducts || unslug(slug);

  // "New In" is a catch-all of every active piece; others filter by collection.
  const isNewIn = slug === "new-in";
  const products = allProducts.filter(
    (p) => p.status === "Active" && (isNewIn || slugify(p.collection) === slug),
  );

  const seasonKey = effectiveSeason(settings.season);
  const seas = SEASONS[seasonKey];
  const styleVars =
    seasonKey !== "none" && seas ? ({ "--c-gold": seas.rgb } as CSSProperties) : undefined;

  return (
    <div style={styleVars}>
      <JsonLd
        data={[
          itemListJsonLd(products, `${SITE_URL}/collections/${slug}`),
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "Collections", url: SITE_URL + "/collections" },
            { name: label, url: SITE_URL + "/collections/" + slug },
          ]),
        ]}
      />
      <StoreShell products={allProducts} settings={settings} bank={BANK}>
        <CollectionView
          label={label}
          sub={isNewIn ? "The latest pieces from the atelier." : undefined}
          products={products}
        />
      </StoreShell>
    </div>
  );
}
