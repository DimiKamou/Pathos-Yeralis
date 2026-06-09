import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getStoreProducts } from "@/lib/products";
import { getAllSettings } from "@/lib/settings";
import { BANK } from "@/lib/bank";
import { effectiveSeason, SEASONS } from "@/lib/seasons";
import { StoreShell } from "@/components/storefront/StoreShell";
import { CollectionView } from "@/components/storefront/CollectionView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Jewelry & Accessories · PATHOS by Yeralis" };

// "Jewelry & Accessories" — the shop-all catalog of every active piece.
export default async function ShopPage() {
  const [products, settings] = await Promise.all([getStoreProducts(), getAllSettings()]);
  const active = products.filter((p) => p.status === "Active");

  const seasonKey = effectiveSeason(settings.season);
  const seas = SEASONS[seasonKey];
  const styleVars =
    seasonKey !== "none" && seas ? ({ "--c-gold": seas.rgb } as CSSProperties) : undefined;

  return (
    <div style={styleVars}>
      <StoreShell products={products} settings={settings} bank={BANK}>
        <CollectionView
          top
          eyebrow="Shop all"
          label="Jewelry & Accessories"
          sub="Every handmade piece, in one place."
          products={active}
        />
      </StoreShell>
    </div>
  );
}
