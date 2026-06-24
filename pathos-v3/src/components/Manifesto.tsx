"use client";

// A single quiet line of ethos between catalogue and atelier — all air, no band.
import { Reveal } from "./Reveal";

export function Manifesto() {
  return (
    <section id="manifesto" className="border-t border-slate/10">
      <div className="mx-auto max-w-page px-5 py-24 text-center md:px-8 md:py-32">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-8 h-px w-8 bg-garnet" />
            <p className="font-display text-[clamp(22px,3.4vw,34px)] font-300 italic leading-[1.4] text-slate">
              Nothing here is mass-made. Each piece is finished by hand in our
              Athens studio — simple, honest, and meant to be kept.
            </p>
            <div className="mt-8 font-ui text-[10px] uppercase tracking-[0.3em] text-ash">Yeralis K. · maker</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
