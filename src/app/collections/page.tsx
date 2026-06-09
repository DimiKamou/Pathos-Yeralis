import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getStoreProducts } from "@/lib/products";
import { getAllSettings } from "@/lib/settings";
import { BANK } from "@/lib/bank";
import { effectiveSeason, SEASONS } from "@/lib/seasons";
import { StoreShell } from "@/components/storefront/StoreShell";
import { CollectionsIndex } from "@/components/storefront/CollectionsIndex";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Collections · PATHOS by Yeralis" };

export default async function CollectionsIndexPage() {
  const [products, settings] = await Promise.all([getStoreProducts(), getAllSettings()]);

  const seasonKey = effectiveSeason(settings.season);
  const seas = SEASONS[seasonKey];
  const styleVars =
    seasonKey !== "none" && seas ? ({ "--c-gold": seas.rgb } as CSSProperties) : undefined;

  return (
    <div style={styleVars}>
      <StoreShell products={products} settings={settings} bank={BANK}>
        <CollectionsIndex collections={settings.collections} />
      </StoreShell>
    </div>
  );
}
