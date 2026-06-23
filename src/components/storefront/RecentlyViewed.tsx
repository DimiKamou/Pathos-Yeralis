"use client";

// "Recently viewed" strip for the PDP. Reads the persisted recent-view ids from
// useShop(), resolves them to live products, drops the currently-open product,
// and mirrors the PDP's "You may also like" card treatment for consistency.
import { eur } from "@/lib/money";
import { ArtBox } from "@/components/storefront/product-art";
import { useShop } from "@/components/storefront/shop-context";
import type { StoreProduct } from "@/lib/types";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { recent, productById, setPdp } = useShop();
  const products = recent
    .map(productById)
    .filter((p): p is StoreProduct => !!p && p.id !== excludeId)
    .slice(0, 4);
  if (products.length === 0) return null;
  return (
    <div className="mt-7 border-t border-ink/10 pt-5">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-mute">Recently viewed</div>
      <div className="grid grid-cols-4 gap-3">
        {products.map((p) => (
          <button key={p.id} onClick={() => setPdp(p)} className="group text-left">
            <span className="block"><ArtBox art={p.art} imageUrl={p.imageUrl} box="h-20 w-full" scale="scale-[0.5]" alt={p.name} /></span>
            <span className="mt-1.5 block truncate text-[11.5px] text-ink transition-colors group-hover:text-gold">{p.name}</span>
            <span className="block text-[11px] font-light text-mute">{eur(p.price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
