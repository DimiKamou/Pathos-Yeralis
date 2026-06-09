"use client";

// Wishlist drawer. Ported from the prototype; saved pieces resolve through
// productById and thumbnails are photo-aware via ArtBox.
import { eur } from "@/lib/money";
import { CloseIcon, HeartIcon } from "@/components/storefront/icons";
import { ArtBox } from "@/components/storefront/product-art";
import { useShop } from "@/components/storefront/shop-context";
import type { StoreProduct } from "@/lib/types";

export function WishDrawer() {
  const { wish, wishOpen, setWishOpen, toggleWish, setPdp, productById } = useShop();
  if (!wishOpen) return null;
  const saved = wish.map(productById).filter(Boolean) as StoreProduct[];
  const openPdp = (p: StoreProduct) => { setWishOpen(false); setPdp(p); };
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" onClick={() => setWishOpen(false)}></div>
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h3 className="font-serif text-[22px] font-medium text-ink">Saved pieces {saved.length > 0 && <span className="text-mute">({saved.length})</span>}</h3>
          <button onClick={() => setWishOpen(false)} className="rounded-lg p-2 text-mute hover:bg-ink/5 hover:text-ink"><CloseIcon size={18} /></button>
        </div>
        {saved.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 text-mute"><HeartIcon size={40} /></div>
            <div className="font-serif text-[20px] text-ink">Nothing saved yet</div>
            <p className="mt-2 text-[13px] font-light text-mute">Tap the heart on any piece to keep it here for later.</p>
            <button onClick={() => setWishOpen(false)} className="mt-5 rounded-full bg-ink px-6 py-2.5 text-[12px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90">Browse the shop</button>
          </div>
        ) : (
          <div className="flex-1 divide-y divide-ink/8 overflow-y-auto px-6">
            {saved.map((p) => {
              const sold = p.stock === 0;
              return (
                <div key={p.id} className="flex gap-4 py-4">
                  <button onClick={() => openPdp(p)}><ArtBox art={p.art} imageUrl={p.imageUrl} box="h-16 w-16" scale="scale-[0.48]" alt={p.name} /></button>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <button onClick={() => openPdp(p)} className="text-left text-[13.5px] font-medium text-ink hover:text-gold">{p.name}</button>
                      <span className="text-[13px] text-ink">{eur(p.price)}</span>
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-mute">{p.collection}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <button onClick={() => openPdp(p)} className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-gold hover:text-ink">{sold ? "View" : "View & add"} →</button>
                      <button onClick={() => toggleWish(p.id)} className="text-[11.5px] text-mute hover:text-rose-500">Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}
