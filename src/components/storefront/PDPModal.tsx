"use client";

// Product detail modal. Ported from the prototype; catalog/state come from
// useShop(), the art panel is photo-aware (ProductMedia), sold-out swaps in the
// shared NotifyForm, and the related strip is photo-aware via ArtBox.
import { useEffect, useState } from "react";
import { eur } from "@/lib/money";
import { CloseIcon, HeartIcon, TruckIcon } from "@/components/storefront/icons";
import { Art } from "@/components/storefront/art";
import { ArtBox, ProductMedia } from "@/components/storefront/product-art";
import { useShop, variantsFor } from "@/components/storefront/shop-context";
import { NotifyForm } from "@/components/storefront/NotifyForm";

function Swatches({ colors }: { colors: string[] }) {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {colors.map((c, i) => (
        <span key={i} className="h-3 w-3 rounded-full ring-1 ring-ink/15" style={{ background: c }} />
      ))}
    </div>
  );
}

export function PDPModal() {
  const { products, pdp, setPdp, add, setCartOpen, toggleWish, inWish } = useShop();
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState(1);
  useEffect(() => {
    if (pdp) {
      const v = variantsFor(pdp.art);
      setVariant(v ? v.opts[0] : "");
      setQty(1);
    }
  }, [pdp]);
  if (!pdp) return null;
  const v = variantsFor(pdp.art);
  const sold = pdp.stock === 0;
  const saved = inWish(pdp.id);
  const addToCart = () => { add(pdp, variant, qty); setPdp(null); setCartOpen(true); };
  const related = products.filter((p) => p.status === "Active" && p.collection === pdp.collection && p.id !== pdp.id).slice(0, 3);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setPdp(null)}></div>
      <div className="relative grid max-h-[92vh] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-paper shadow-2xl md:grid-cols-2">
        <button onClick={() => setPdp(null)} className="absolute right-3 top-3 z-10 rounded-full bg-paper/70 p-2 text-ink/60 hover:text-ink" aria-label="Close"><CloseIcon size={18} /></button>
        <div className="relative flex items-center justify-center bg-sand/40 p-10">
          {pdp.imageUrl ? (
            <ProductMedia art={pdp.art} imageUrl={pdp.imageUrl} alt={pdp.name} imgClass="h-full w-full object-cover" />
          ) : (
            <div className="scale-[1.55]">{Art[pdp.art]}</div>
          )}
          <button onClick={() => toggleWish(pdp.id)} aria-label={saved ? "Remove from saved" : "Save piece"}
            className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 shadow-sm transition-colors ${saved ? "text-gold" : "text-ink/55 hover:text-ink"}`}><HeartIcon size={17} filled={saved} /></button>
        </div>
        <div className="overflow-y-auto p-8">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">{pdp.collection}</div>
          <h3 className="mt-2 font-serif text-[30px] font-medium leading-tight text-ink">{pdp.name}</h3>
          <div className="mt-2 text-[18px] font-light text-ink">{eur(pdp.price)}</div>
          <p className="mt-4 text-[13.5px] font-light leading-relaxed text-mute">{pdp.desc}</p>
          <div className="mt-3 text-[12px] tracking-wide text-mute">{pdp.material}</div>
          <Swatches colors={pdp.swatches} />
          {v && !sold && (
            <div className="mt-5">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-mute">{v.label}</div>
              <div className="flex flex-wrap gap-2">
                {v.opts.map((o) => (
                  <button key={o} onClick={() => setVariant(o)} className={`rounded-full border px-3.5 py-1.5 text-[12px] tracking-wide transition-colors ${variant === o ? "border-gold bg-gold/10 text-gold" : "border-ink/20 text-ink/70 hover:border-ink/40"}`}>{o}</button>
                ))}
              </div>
            </div>
          )}
          {sold ? (
            <NotifyForm />
          ) : (
            <>
              <div className="mt-6 flex items-center gap-5">
                <div className="flex items-center rounded-full border border-ink/20">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1.5 text-ink/70 hover:text-ink">−</button>
                  <span className="w-8 text-center text-[13px] text-ink">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-1.5 text-ink/70 hover:text-ink">+</button>
                </div>
                <span className="text-[12px] text-mute">{pdp.stock + " in stock"}</span>
              </div>
              <button onClick={addToCart}
                className="mt-6 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink py-3.5 text-[12.5px] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-ink/90">
                Add to cart — {eur(pdp.price * qty)}
              </button>
            </>
          )}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-light tracking-wide text-mute"><TruckIcon size={14} className="text-gold" /> Free EU shipping over €100 · 30-day returns</div>
          {related.length > 0 && (
            <div className="mt-7 border-t border-ink/10 pt-5">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-mute">You may also like</div>
              <div className="grid grid-cols-3 gap-3">
                {related.map((r) => (
                  <button key={r.id} onClick={() => setPdp(r)} className="group text-left">
                    <span className="block"><ArtBox art={r.art} imageUrl={r.imageUrl} box="h-20 w-full" scale="scale-[0.5]" alt={r.name} /></span>
                    <span className="mt-1.5 block truncate text-[11.5px] text-ink transition-colors group-hover:text-gold">{r.name}</span>
                    <span className="block text-[11px] font-light text-mute">{eur(r.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
