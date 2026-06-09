import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getStoreProducts } from "@/lib/products";
import { getAllSettings } from "@/lib/settings";
import { BANK } from "@/lib/bank";
import { effectiveSeason, SEASONS } from "@/lib/seasons";
import { StoreShell } from "@/components/storefront/StoreShell";
import { unslug } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${unslug(slug)} · PATHOS by Yeralis` };
}

// Generic landing for custom menu items added in the admin (Storefront Menu).
// Known items (About, Jewelry) have dedicated pages; everything else lands here
// with a clean, on-brand placeholder titled by the menu label.
export default async function GenericPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [products, settings] = await Promise.all([getStoreProducts(), getAllSettings()]);
  const item = settings.menu.find((m) => m.id === slug);
  const title = item?.label || unslug(slug);

  const seasonKey = effectiveSeason(settings.season);
  const seas = SEASONS[seasonKey];
  const styleVars =
    seasonKey !== "none" && seas ? ({ "--c-gold": seas.rgb } as CSSProperties) : undefined;

  return (
    <div style={styleVars}>
      <StoreShell products={products} settings={settings} bank={BANK}>
        <main className="mx-auto w-full max-w-[760px] px-8 pb-28 pt-24 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">PATHOS · by Yeralis</div>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-[0.01em] text-ink">{title}</h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] font-light leading-relaxed text-mute">
            This page is coming soon. In the meantime, explore our handmade pieces.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <a href="/shop" className="rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90">
              Shop all
            </a>
            <a href="/collections" className="rounded-full border border-ink/20 px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-ink/80 hover:border-ink hover:text-ink">
              Collections
            </a>
          </div>
        </main>
      </StoreShell>
    </div>
  );
}
