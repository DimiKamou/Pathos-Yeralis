"use client";

// "Visit us" — the Athens atelier. Contact details carried over from the
// original seed (the production app makes these admin-editable; here they're
// static). The map is a stylised stone plate rather than an embed.
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
    <section id="atelier" className="mx-auto max-w-page scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
      <div className="grid items-stretch gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col justify-center">
            <div className="mb-4 flex items-center gap-3 font-ui text-[10px] uppercase tracking-[0.34em] text-garnet">
              <span className="h-px w-8 bg-garnet" /> The atelier
            </div>
            <h2 className="font-display text-[clamp(30px,4.4vw,48px)] font-500 leading-tight text-slate">
              Find us in the old town, beneath the Acropolis.
            </h2>
            <p className="mt-5 max-w-md font-ui text-[13.5px] font-300 leading-relaxed text-ash">
              Every piece is made and sold from the same small room in Pláka. Come
              try things on, talk through a commission, or just say hello.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-y-6 gap-x-4">
              {[
                ["Where", `${CONTACT.addr1}\n${CONTACT.addr2}`],
                ["Hours", `${CONTACT.hours1}\n${CONTACT.hours2}`],
                ["Write", CONTACT.email],
                ["Call", CONTACT.phone],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="font-ui text-[10px] uppercase tracking-[0.24em] text-garnet">{label}</div>
                  <div className="mt-1.5 whitespace-pre-line font-ui text-[13px] leading-relaxed text-slate">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative aspect-[4/3] overflow-hidden border border-slate/10 bg-stone/50 lg:aspect-auto lg:h-full">
            {/* stylised plan: meander streets + a garnet pin at the coordinates */}
            <div className="absolute inset-0 opacity-[0.5] [background-image:repeating-linear-gradient(0deg,rgb(var(--c-slate)/0.12)_0_1px,transparent_1px_46px),repeating-linear-gradient(90deg,rgb(var(--c-slate)/0.12)_0_1px,transparent_1px_46px)]" />
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-garnet/15" />
            <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
              <span className="block h-3 w-3 rotate-45 bg-garnet ring-4 ring-marble/70" />
            </div>
            <div className="absolute bottom-4 left-4 font-ui text-[10px] uppercase tracking-[0.2em] text-ash">
              {CONTACT.lat}° N · {CONTACT.lng}° E
            </div>
            <div className="absolute right-4 top-4 font-display text-[15px] italic text-slate/70">Pláka</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
