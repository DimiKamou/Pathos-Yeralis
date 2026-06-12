"use client";

// A piece presented like an artifact in a vitrine: line-art floating on stone,
// caption below. Hover tints the work garnet and lifts it. Opens the PDP.
import { useShop } from "./shop-context";
import { Art } from "./art";
import { HeartIcon } from "./icons";
import { eur } from "@/lib/money";
import { feelingByKey } from "@/lib/catalog";
import type { StoreProduct } from "@/lib/types";

export function ProductCard({ p, tall = false }: { p: StoreProduct; tall?: boolean }) {
  const { setPdp, toggleWish, inWish } = useShop();
  const sold = p.stock === 0;
  const saved = inWish(p.id);
  const feeling = feelingByKey(p.feeling);

  return (
    <article className="group relative">
      <button onClick={() => setPdp(p)} aria-label={`View ${p.name}`} className="block w-full text-left">
        <div className={`relative grid place-items-center overflow-hidden border border-slate/10 bg-stone/40 ${tall ? "aspect-[4/5]" : "aspect-square"}`}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-chalk/50 via-transparent to-stone/20" />
          <div className="scale-110 text-slate transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:text-garnet">
            {Art[p.art] || Art.drop}
          </div>
          {sold && (
            <span className="absolute left-3 top-3 bg-slate px-2.5 py-1 font-ui text-[9px] uppercase tracking-[0.2em] text-marble">
              Claimed
            </span>
          )}
          <span className="absolute bottom-3 right-3 font-ui text-[9px] uppercase tracking-[0.2em] text-ash opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {feeling.gloss}
          </span>
        </div>
      </button>

      <button
        onClick={() => toggleWish(p.id)}
        aria-label={saved ? "Remove from saved" : "Save piece"}
        className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-marble/80 backdrop-blur transition-colors ${saved ? "text-garnet" : "text-ash hover:text-slate"}`}
      >
        <HeartIcon size={16} filled={saved} />
      </button>

      <div className="mt-3.5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[17px] font-500 leading-tight text-slate transition-colors group-hover:text-garnet">{p.name}</h3>
          <p className="mt-0.5 truncate font-ui text-[11px] uppercase tracking-[0.16em] text-ash">{p.collection}</p>
        </div>
        <div className="shrink-0 font-ui text-[14px] font-500 text-garnet">{eur(p.price)}</div>
      </div>
    </article>
  );
}
