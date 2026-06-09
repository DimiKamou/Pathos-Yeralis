"use client";

// Visit-us / atelier map section. Ported verbatim from the prototype.
import type { ReactNode } from "react";
import { PinIcon, ClockIcon, PhoneIcon, MailIcon } from "@/components/storefront/icons";

function InfoRow({ icon, label, children }: { icon: ReactNode; label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-mute">{label}</div>
        <div className="mt-1 text-[14px] font-light leading-relaxed text-ink">{children}</div>
      </div>
    </div>
  );
}

export function VisitUs() {
  return (
    <section id="visit" className="mx-auto w-full max-w-[1240px] px-8 pt-28">
      <header className="mb-10 text-center">
        <h2 className="font-serif text-[34px] font-medium tracking-[0.02em] text-ink">Visit the Atelier</h2>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] font-light leading-relaxed text-mute">Find us in the heart of Pláka — come try on the pieces and meet the maker.</p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="relative overflow-hidden rounded-xl border border-ink/10 bg-sand/40">
          {/* stylized fallback shown if the live map can't load */}
          <div className="absolute inset-0">
            <svg className="h-full w-full" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <rect width="600" height="420" fill="rgb(var(--c-sand))" />
              <g stroke="rgb(var(--c-ink) / 0.10)" strokeWidth="2" fill="none">
                <path d="M-20 110 H620 M-20 250 H620 M-20 340 H620" />
                <path d="M120 -20 V440 M300 -20 V440 M450 -20 V440" />
                <path d="M-20 60 L260 440 M340 -20 L640 300" strokeWidth="6" stroke="rgb(var(--c-ink) / 0.07)" />
              </g>
              <g fill="rgb(var(--c-ink) / 0.05)"><rect x="140" y="130" width="140" height="100" rx="4" /><rect x="320" y="270" width="110" height="60" rx="4" /><rect x="40" y="270" width="60" height="60" rx="4" /></g>
            </svg>
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <span className="relative flex h-4 w-4"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/50"></span><span className="relative inline-flex h-4 w-4 rounded-full bg-gold ring-4 ring-paper"></span></span>
              <span className="mt-2 rounded-full bg-paper px-3 py-1 text-[11px] font-medium tracking-wide text-ink shadow-sm">12 Adrianou St · Pláka</span>
            </div>
          </div>
          <iframe title="PATHOS atelier location" className="relative block h-[300px] w-full lg:h-[420px]" loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=23.7188%2C37.9676%2C23.7352%2C37.9756&layer=mapnik&marker=37.9716%2C23.7270"
            style={{ border: 0, filter: "grayscale(0.25) sepia(0.12)", background: "transparent" }}></iframe>
        </div>
        <div className="flex flex-col justify-center gap-7 rounded-xl border border-ink/10 bg-paper p-8 lg:p-9">
          <InfoRow icon={<PinIcon size={19} />} label="Atelier &amp; Showroom">12 Adrianou Street<br />Pláka, Athens 105 56, Greece</InfoRow>
          <InfoRow icon={<ClockIcon size={19} />} label="Opening hours">Mon–Sat · 10:00–19:00<br />Sun · by appointment</InfoRow>
          <InfoRow icon={<PhoneIcon size={18} />} label="Call us">+30 210 322 1180</InfoRow>
          <InfoRow icon={<MailIcon size={18} />} label="Email">hello@pathos-jewelry.com</InfoRow>
          <a href="https://www.openstreetmap.org/?mlat=37.9716&mlon=23.7270#map=17/37.9716/23.7270" target="_blank" rel="noopener"
            className="mt-1 inline-flex w-fit items-center gap-2 border-b border-gold pb-1 text-[12px] font-medium uppercase tracking-[0.18em] text-gold transition-colors hover:text-ink hover:border-ink">
            Get directions →
          </a>
        </div>
      </div>
    </section>
  );
}
