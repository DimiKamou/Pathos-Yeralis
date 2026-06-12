"use client";

// "Visit us" — the Athens atelier, kept light and quiet. Contact details carry
// over from the original seed (admin-editable in production; static here).
import { Reveal } from "./Reveal";

const CONTACT = {
  addr1: "12 Adrianou Street",
  addr2: "Pláka, Athens 105 56, Greece",
  hours1: "Mon–Sat · 10:00–19:00",
  hours2: "Sun · by appointment",
  email: "hello@pathos-jewelry.com",
  phone: "+30 210 322 1180",
  lat: 37.9716,
  lng: 23.727,
};

export function Atelier() {
  return (
    <section id="atelier" className="border-t border-slate/10">
      <div className="mx-auto grid max-w-page items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <Reveal>
          <div>
            <div className="mb-4 font-ui text-[10px] uppercase tracking-[0.32em] text-garnet">The atelier</div>
            <h2 className="font-display text-[clamp(28px,4vw,44px)] font-300 leading-tight text-slate">Find us in Pláka, beneath the Acropolis.</h2>
            <p className="mt-5 max-w-md font-ui text-[13.5px] font-300 leading-relaxed text-ash">
              Every piece is made and sold from the same small room. Come try
              things on, talk through a commission, or just say hello.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6">
              {[
                ["Where", `${CONTACT.addr1}\n${CONTACT.addr2}`],
                ["Hours", `${CONTACT.hours1}\n${CONTACT.hours2}`],
                ["Write", CONTACT.email],
                ["Call", CONTACT.phone],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="font-ui text-[10px] uppercase tracking-[0.22em] text-ash">{label}</div>
                  <div className="mt-1.5 whitespace-pre-line font-ui text-[13px] leading-relaxed text-slate">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative aspect-[4/3] overflow-hidden border border-slate/10 bg-chalk">
            <div className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(0deg,rgb(var(--c-slate)/0.06)_0_1px,transparent_1px_48px),repeating-linear-gradient(90deg,rgb(var(--c-slate)/0.06)_0_1px,transparent_1px_48px)]" />
            <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
              <span className="block h-2.5 w-2.5 bg-garnet ring-4 ring-marble" />
            </div>
            <div className="absolute bottom-4 left-4 font-ui text-[10px] uppercase tracking-[0.18em] text-ash">{CONTACT.lat}° N · {CONTACT.lng}° E</div>
            <div className="absolute right-4 top-4 font-display text-[15px] italic text-ash">Pláka</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
