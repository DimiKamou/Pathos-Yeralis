"use client";

// A calm, light hero: one light-serif statement and a great deal of air. A
// single piece of line-art sits in the negative space at large sizes.
import { Art } from "./art";

export function Hero() {
  return (
    <section className="relative bg-marble">
      <div className="mx-auto grid max-w-page items-center gap-10 px-5 py-24 md:px-8 md:py-36 lg:grid-cols-[1.45fr_0.55fr]">
        <div>
          <div className="mb-7 font-ui text-[10px] uppercase tracking-[0.32em] text-garnet">Handmade in Athens · since 2014</div>
          <h1 className="font-display text-[clamp(40px,7vw,92px)] font-300 leading-[1.04] tracking-[-0.01em] text-slate">
            Quiet pieces<br />for a life worn close.
          </h1>
          <p className="mt-8 max-w-sm font-ui text-[14px] font-300 leading-relaxed text-ash">
            Gemstones, shells and minerals from the Aegean — made by hand, kept
            simple, and meant to be worn every day.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-7">
            <a href="#catalog" className="rounded-full bg-slate px-8 py-3.5 font-ui text-[11px] font-500 uppercase tracking-[0.18em] text-marble transition-colors hover:bg-slate/85">View the collection</a>
            <a href="#atelier" className="font-ui text-[11px] uppercase tracking-[0.18em] text-ash underline-offset-4 hover:text-slate hover:underline">Visit the atelier</a>
          </div>
        </div>

        <div className="relative hidden items-center justify-center lg:flex">
          <div className="absolute h-60 w-60 rounded-full border border-slate/8" />
          <div className="scale-[1.5] text-stone">{Art.necklace}</div>
        </div>
      </div>
      <div className="mx-auto max-w-page px-5 md:px-8"><div className="border-b border-slate/10" /></div>
    </section>
  );
}
