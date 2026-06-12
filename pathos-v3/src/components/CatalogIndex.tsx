"use client";

// The catalog as a calm index: one clean grid, a quiet collection filter, and
// search. Organised by collection (like the original), not by feeling.
import { useMemo, useState } from "react";
import { useShop } from "./shop-context";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function CatalogIndex() {
  const { active, query, results } = useShop();
  const [collection, setCollection] = useState("All");
  const searching = query.trim().length > 0;

  const collections = useMemo(() => ["All", ...Array.from(new Set(active.map((p) => p.collection)))], [active]);
  const shown = collection === "All" ? active : active.filter((p) => p.collection === collection);
  const list = searching ? results : shown;

  return (
    <section id="catalog" className="mx-auto max-w-page scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="font-ui text-[10px] uppercase tracking-[0.32em] text-garnet">The collection</div>
        <h2 className="mt-3 font-display text-[clamp(26px,3.6vw,40px)] font-300 text-slate">A small, considered catalogue.</h2>
      </div>

      {!searching && (
        <div className="mb-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {collections.map((c) => (
            <button
              key={c}
              onClick={() => setCollection(c)}
              className={`font-ui text-[11px] uppercase tracking-[0.16em] transition-colors ${collection === c ? "text-slate underline decoration-garnet decoration-1 underline-offset-[6px]" : "text-ash hover:text-slate"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {searching && (
        <p className="mb-10 text-center font-ui text-[12px] uppercase tracking-[0.2em] text-ash">
          {results.length} {results.length === 1 ? "piece" : "pieces"} for &ldquo;{query}&rdquo;
        </p>
      )}

      {list.length === 0 ? (
        <p className="py-10 text-center font-display text-[22px] font-300 italic text-ash">Nothing here — try another word.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 60}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
