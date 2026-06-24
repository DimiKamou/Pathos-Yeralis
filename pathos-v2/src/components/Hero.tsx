"use client";

// The hero is the thesis: not a product carousel, but the brand's claim. The
// wordmark "strikes" in letter by letter (engraving), and a single piece floats
// out of the dark like an artifact under vitrine light.
import { Art } from "./art";

const WORD = "ΠΑΘΟΣ";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-night text-marble">
      {/* faint vertical meander rail */}
      <div className="pointer-events-none absolute inset-y-0 left-8 hidden w-px bg-marble/10 lg:block" />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-garnet/15 blur-3xl" />

      <div className="mx-auto grid max-w-page items-center gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="mb-7 flex items-center gap-3 font-ui text-[10px] uppercase tracking-[0.34em] text-stone">
            <span className="h-px w-8 bg-garnet" /> Handmade in Pláka · Athens
          </div>

          <h1 className="font-display font-800 leading-[0.92] tracking-[0.06em] text-[clamp(72px,17vw,168px)]" aria-label={WORD}>
            {WORD.split("").map((ch, i) => (
              <span key={i} className="strike-letter" style={{ animationDelay: `${0.15 + i * 0.09}s` }}>
                {ch}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-md font-display text-[22px] italic leading-snug text-marble/90 md:text-[26px]">
            Jewelry for the feelings that don&rsquo;t have words.
          </p>
          <p className="mt-4 max-w-md font-ui text-[13.5px] font-300 leading-relaxed text-stone">
            Gemstones, shells and minerals from the Aegean — struck by hand, then
            arranged not by category, but by the feeling they carry.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a href="#feelings" className="rounded-full bg-garnet px-8 py-3.5 font-ui text-[11.5px] font-600 uppercase tracking-[0.18em] text-chalk transition-colors hover:bg-garnet/85">
              Enter the work
            </a>
            <a href="#manifesto" className="font-ui text-[11.5px] uppercase tracking-[0.18em] text-stone underline-offset-4 hover:text-marble hover:underline">
              How it&rsquo;s made
            </a>
          </div>
        </div>

        <div className="relative hidden items-center justify-center lg:flex">
          <div className="absolute h-72 w-72 rounded-full border border-marble/10" />
          <div className="absolute h-52 w-52 rounded-full border border-marble/10" />
          <div className="scale-[1.7] text-marble/85 [&_*]:[stroke-width:1.2]">{Art.drop}</div>
        </div>
      </div>
    </section>
  );
}
