"use client";

// Product detail modal — same logic (variants, qty, save, sold-out → Notify,
// related strip), pared back to the minimalist palette. Ink-pill add-to-cart,
// gold price, related drawn from the same collection (like the original).
import { useEffect, useState } from "react";
import { eur } from "@/lib/money";
import { CloseIcon, HeartIcon, TruckIcon } from "./icons";
import { Art } from "./art";
import { ArtBox } from "./product-art";
import { useShop } from "./shop-context";
import { variantsFor } from "@/lib/catalog";
import { NotifyForm } from "./NotifyForm";

export function PDPModal() {
  const { active, pdp, setPdp, add, setCartOpen, toggleWish, inWish } = useShop();
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (pdp) {
      const v = variantsFor(pdp.art);
      setVariant(v ? v.opts[0] : "");
      setQty(1);
    }
  }, [pdp]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPdp(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPdp]);

  if (!pdp) return null;
  const v = variantsFor(pdp.art);
  const sold = pdp.stock === 0;
  const saved = inWish(pdp.id);
  const related = active.filter((p) => p.collection === pdp.collection && p.id !== pdp.id).slice(0, 3);
  const addToCart = () => { add(pdp, variant, qty); setPdp(null); setCartOpen(true); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-night/50 backdrop-blur-[2px]" onClick={() => setPdp(null)} />
      <div className="relative grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-hidden border border-slate/10 bg-marble shadow-2xl md:grid-cols-2">
        <button onClick={() => setPdp(null)} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-marble/70 text-ash hover:text-slate"><CloseIcon size={18} /></button>

        <div className="relative flex items-center justify-center bg-chalk p-10">
          <div className="scale-[1.7] text-slate">{Art[pdp.art] || Art.drop}</div>
          <button onClick={() => toggleWish(pdp.id)} aria-label={saved ? "Remove from saved" : "Save piece"} className={`absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-marble/80 transition-colors ${saved ? "text-garnet" : "text-ash hover:text-slate"}`}><HeartIcon size={17} filled={saved} /></button>
        </div>

        <div className="overflow-y-auto p-7 md:p-9">
          <div className="font-ui text-[10px] uppercase tracking-[0.22em] text-ash">{pdp.collection}</div>
          <h3 className="mt-2 font-display text-[30px] font-400 leading-tight text-slate">{pdp.name}</h3>
          <div className="mt-1.5 font-ui text-[16px] text-garnet">{eur(pdp.price)}</div>
          <p className="mt-4 font-ui text-[13.5px] font-300 leading-relaxed text-ash">{pdp.desc}</p>
          <div className="mt-3 font-ui text-[12px] tracking-wide text-slate/70">{pdp.material}</div>

          <div className="mt-4 flex items-center gap-1.5">
            {pdp.swatches.map((c, i) => (<span key={i} className="h-3.5 w-3.5 rounded-full ring-1 ring-slate/15" style={{ background: c }} />))}
          </div>

          {v && !sold && (
            <div className="mt-6">
              <div className="mb-2 font-ui text-[10px] uppercase tracking-[0.2em] text-ash">{v.label}</div>
              <div className="flex flex-wrap gap-2">
                {v.opts.map((o) => (
                  <button key={o} onClick={() => setVariant(o)} className={`border px-3.5 py-1.5 font-ui text-[12px] tracking-wide transition-colors ${variant === o ? "border-garnet text-slate" : "border-slate/20 text-slate/70 hover:border-slate/40"}`}>{o}</button>
                ))}
              </div>
            </div>
          )}

          {sold ? (
            <NotifyForm />
          ) : (
            <>
              <div className="mt-6 flex items-center gap-5">
                <div className="flex items-center border border-slate/20">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" className="px-3 py-1.5 text-slate/70 hover:text-slate">−</button>
                  <span className="w-8 text-center font-ui text-[13px] text-slate">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} aria-label="Increase" className="px-3 py-1.5 text-slate/70 hover:text-slate">+</button>
                </div>
                <span className="font-ui text-[12px] text-ash">{pdp.stock} in stock</span>
              </div>
              <button onClick={addToCart} className="mt-6 w-full rounded-full bg-slate py-3.5 font-ui text-[11.5px] font-500 uppercase tracking-[0.18em] text-marble transition-colors hover:bg-slate/85">
                Add to bag — {eur(pdp.price * qty)}
              </button>
            </>
          )}

          <div className="mt-3 flex items-center justify-center gap-1.5 font-ui text-[11px] font-300 tracking-wide text-ash"><TruckIcon size={14} /> Free EU shipping over €100 · 30-day returns</div>

          {related.length > 0 && (
            <div className="mt-8 border-t border-slate/10 pt-5">
              <div className="mb-3 font-ui text-[10px] uppercase tracking-[0.2em] text-ash">More from {pdp.collection}</div>
              <div className="grid grid-cols-3 gap-3">
                {related.map((r) => (
                  <button key={r.id} onClick={() => setPdp(r)} className="group text-left">
                    <ArtBox art={r.art} box="h-20 w-full" scale="scale-[0.5]" tint="text-slate group-hover:text-garnet" />
                    <span className="mt-1.5 block truncate font-ui text-[11.5px] text-slate transition-colors group-hover:text-garnet">{r.name}</span>
                    <span className="block font-ui text-[11px] text-ash">{eur(r.price)}</span>
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
