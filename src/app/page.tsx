import { getStoreProducts } from "@/lib/products";
import { getAllSettings } from "@/lib/settings";
import { BANK } from "@/lib/bank";
import { effectiveSeason, SEASONS } from "@/lib/seasons";
import { Storefront } from "@/components/storefront/Storefront";
import type { CSSProperties } from "react";

// Always reflect the latest catalog + admin-editable settings.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, settings] = await Promise.all([getStoreProducts(), getAllSettings()]);

  // Apply the active seasonal accent by overriding --c-gold for the subtree
  // (replaces the prototype's localStorage → documentElement bridge).
  const seasonKey = effectiveSeason(settings.season);
  const seas = SEASONS[seasonKey];
  const styleVars =
    seasonKey !== "none" && seas ? ({ "--c-gold": seas.rgb } as CSSProperties) : undefined;

  return (
    <div style={styleVars}>
      <Storefront
        products={products}
        settings={settings}
        bank={BANK}
        heroImage={process.env.HERO_IMAGE_URL || null}
      />
    </div>
  );
}
