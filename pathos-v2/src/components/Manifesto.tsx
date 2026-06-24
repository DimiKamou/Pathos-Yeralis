"use client";

// A quiet dark band between the catalog and the atelier — the maker's claim,
// set as a single italic display line. No stat-counter template; just the voice.
import { Reveal } from "./Reveal";

export function Manifesto() {
  return (
    <section id="manifesto" className="scroll-mt-20 bg-night text-marble">
      <div className="mx-auto max-w-page px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-8 h-px w-10 bg-garnet" />
            <blockquote className="font-display text-[clamp(26px,4.2vw,44px)] font-400 italic leading-[1.25] text-marble">
              &ldquo;Every piece is struck by hand, one at a time. A little asymmetry
              is not a flaw — it is the proof that a person, not a machine, made the
              thing you wear.&rdquo;
            </blockquote>
            <div className="mt-8 font-ui text-[11px] uppercase tracking-[0.3em] text-stone">Yeralis K. · founder &amp; maker</div>
          </div>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-px overflow-hidden border border-marble/10 sm:grid-cols-3">
          {[
            ["Struck, not cast", "Each piece worked by hand in the Pláka studio."],
            ["Stones of the Aegean", "Hematite, coral, chalcedony, paua, lava."],
            ["Made to outlast us", "Sterling, 24K plate, gold-fill — and repairs for life."],
          ].map(([t, d]) => (
            <div key={t} className="bg-night px-6 py-7">
              <div className="font-display text-[18px] font-500 text-marble">{t}</div>
              <p className="mt-2 font-ui text-[12.5px] font-300 leading-relaxed text-stone">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
