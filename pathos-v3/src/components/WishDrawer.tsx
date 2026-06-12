"use client";

// Saved-pieces drawer — ported from the original wishlist: thumbnail, name,
// price, "View & add", remove, with an empty state.
import { eur } from "@/lib/money";
import { CloseIcon, HeartIcon } from "./icons";
import { ArtBox } from "./product-art";
import { useShop } from "./shop-context";

export function WishDrawer() {
  const { wish, wishOpen, setWishOpen, productById, toggleWish, setPdp } = useShop();
  if (!wishOpen) return null;
  const saved = wish.map((id) => productById(id)).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-night/45 backdrop-blur-[1px]" onClick={() => setWishOpen(false)} />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-marble shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate/10 px-6 py-5">
          <h3 className="font-display text-[22px] font-500 text-slate">Saved {saved.length > 0 && <span className="text-ash">· {saved.length}</span>}</h3>
          <button onClick={() => setWishOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-ash hover:bg-stone/50 hover:text-slate"><CloseIcon size={18} /></button>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-ash">
            <HeartIcon size={34} />
            <div className="mt-4 font-display text-[20px] text-slate">No saved pieces</div>
            <p className="mt-2 font-ui text-[13px] font-300">Tap the heart on a piece to keep it here.</p>
            <button onClick={() => setWishOpen(false)} className="mt-5 rounded-full bg-slate px-6 py-2.5 font-ui text-[11px] font-600 uppercase tracking-[0.16em] text-marble hover:bg-slate/90">Browse the work</button>
          </div>
        ) : (
          <div className="flex-1 divide-y divide-slate/10 overflow-y-auto px-6">
            {saved.map((p) => p && (
              <div key={p.id} className="flex items-center gap-4 py-4">
                <ArtBox art={p.art} box="h-16 w-16" scale="scale-[0.48]" />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[15px] font-500 text-slate">{p.name}</div>
                  <div className="font-ui text-[12.5px] text-garnet">{eur(p.price)}</div>
                  <button onClick={() => { setWishOpen(false); setPdp(p); }} className="mt-1.5 font-ui text-[11px] uppercase tracking-[0.16em] text-slate underline-offset-4 hover:text-garnet hover:underline">View &amp; add</button>
                </div>
                <button onClick={() => toggleWish(p.id)} aria-label="Remove" className="font-ui text-[11.5px] text-ash hover:text-garnet">Remove</button>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
