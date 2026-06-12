"use client";

// THE signature: the catalog arranged by feeling, not by category. Each feeling
// gets a giant Greek word and a one-line invitation; its pieces flow alongside.
// When a search is active, this collapses to a flat result grid instead.
import { useShop } from "./shop-context";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { FEELINGS } from "@/lib/catalog";

export function FeelingIndex() {
  const { query, results, byFeeling } = useShop();
  const searching = query.trim().length > 0;

  return (
    <section id="feelings" className="mx-auto max-w-page scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
      <div className="mb-16 max-w-xl">
        <div className="mb-4 flex items-center gap-3 font-ui text-[10px] uppercase tracking-[0.34em] text-garnet">
          <span className="h-px w-8 bg-garnet" /> The catalog, by feeling
        </div>
        <h2 className="font-display text-[clamp(30px,4.4vw,46px)] font-500 leading-tight text-slate">
          We don&rsquo;t sort by necklace or ring. We sort by what you came here feeling.
        </h2>
      </div>

      {searching ? (
        <div>
          <p className="mb-8 font-ui text-[12px] uppercase tracking-[0.2em] text-ash">
            {results.length} {results.length === 1 ? "piece" : "pieces"} for &ldquo;{query}&rdquo;
          </p>
          {results.length === 0 ? (
            <p className="font-display text-[22px] italic text-ash">Nothing under that word — try a stone, or a feeling.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-24">
          {FEELINGS.map((f) => {
            const items = byFeeling(f.key);
            if (items.length === 0) return null;
            return (
              <div key={f.key} className="grid gap-10 lg:grid-cols-[0.82fr_2.18fr]">
                <Reveal>
                  <div className="lg:sticky lg:top-28 lg:self-start">
                    <div className="font-display font-800 leading-[0.82] tracking-[0.04em] text-[clamp(60px,9vw,116px)] text-slate">{f.greek}</div>
                    <div className="mt-4 flex items-baseline gap-3">
                      <span className="font-display text-[22px] italic text-garnet">{f.roman}</span>
                      <span className="font-ui text-[11px] uppercase tracking-[0.24em] text-ash">{f.gloss}</span>
                    </div>
                    <p className="mt-4 max-w-xs font-ui text-[13.5px] font-300 leading-relaxed text-ash">{f.line}</p>
                    <div className="meander-rule mt-6 w-28" />
                  </div>
                </Reveal>

                <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
                  {items.map((p, i) => (
                    <Reveal key={p.id} delay={i * 70}>
                      <ProductCard p={p} tall={i === 0} />
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
