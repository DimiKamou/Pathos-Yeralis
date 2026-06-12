"use client";

// A quiet product card: line-art on a soft panel, a centred caption, gold only
// as a hover whisper. The heart appears on hover (or stays if already saved).
import { useShop } from "./shop-context";
import { Art } from "./art";
import { HeartIcon } from "./icons";
import { eur } from "@/lib/money";
import type { StoreProduct } from "@/lib/types";

export function ProductCard({ p }: { p: StoreProduct }) {
  const { setPdp, toggleWish, inWish } = useShop();
  const sold = p.stock === 0;
  const saved = inWish(p.id);

  return (
    <article className="group relative">
      <button onClick={() => setPdp(p)} aria-label={`View ${p.name}`} className="block w-full text-left">
        <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-chalk">
          <div className="scale-100 text-slate transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:text-garnet">
            {Art[p.art] || Art.drop}
          </div>
          {sold && (
            <span className="absolute left-3 top-3 font-ui text-[9px] uppercase tracking-[0.2em] text-ash">Claimed</span>
          )}
        </div>
      </button>

      <button
        onClick={() => toggleWish(p.id)}
        aria-label={saved ? "Remove from saved" : "Save piece"}
        className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full transition-all ${saved ? "text-garnet opacity-100" : "text-ash opacity-0 hover:text-slate group-hover:opacity-100"}`}
      >
        <HeartIcon size={16} filled={saved} />
      </button>

      <div className="mt-4 text-center">
        <div className="font-ui text-[10px] uppercase tracking-[0.18em] text-ash">{p.collection}</div>
        <h3 className="mt-1 font-display text-[17px] font-400 text-slate transition-colors group-hover:text-garnet">{p.name}</h3>
        <div className="mt-1 font-ui text-[12.5px] font-300 text-ash">{eur(p.price)}</div>
      </div>
    </article>
  );
}
