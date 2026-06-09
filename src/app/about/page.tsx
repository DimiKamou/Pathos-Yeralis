import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getStoreProducts } from "@/lib/products";
import { getAllSettings } from "@/lib/settings";
import { BANK } from "@/lib/bank";
import { effectiveSeason, SEASONS } from "@/lib/seasons";
import { StoreShell } from "@/components/storefront/StoreShell";
import { VisitUs } from "@/components/storefront/VisitUs";
import { Art } from "@/components/storefront/art";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About · PATHOS by Yeralis" };

function Value({ art, title, body }: { art: string; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid h-24 w-24 place-items-center">
        <div className="scale-[0.6]">{Art[art] || Art.drop}</div>
      </div>
      <div className="mt-3 font-serif text-[20px] font-medium text-ink">{title}</div>
      <p className="mt-2 max-w-[18rem] text-[13px] font-light leading-relaxed text-mute">{body}</p>
    </div>
  );
}

export default async function AboutPage() {
  const [products, settings] = await Promise.all([getStoreProducts(), getAllSettings()]);
  const seasonKey = effectiveSeason(settings.season);
  const seas = SEASONS[seasonKey];
  const styleVars =
    seasonKey !== "none" && seas ? ({ "--c-gold": seas.rgb } as CSSProperties) : undefined;

  return (
    <div style={styleVars}>
      <StoreShell products={products} settings={settings} bank={BANK}>
        <main>
          <section className="mx-auto w-full max-w-[760px] px-8 pt-20 text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Our Story</div>
            <h1 className="mt-3 font-serif text-[44px] font-medium leading-[1.1] tracking-[0.01em] text-ink">
              Shaped by hand, by the Aegean
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-[14.5px] font-light leading-[1.9] text-mute">
              PATHOS by Yeralis is a small atelier in the heart of Pláka, beneath the Acropolis. Every
              piece is made by hand from gemstones, shells and minerals drawn from the Greek shoreline —
              quiet, weathered, and made to last a lifetime.
            </p>
          </section>

          <section className="mx-auto grid w-full max-w-[1100px] items-center gap-10 px-8 pt-20 lg:grid-cols-2">
            <div className="flex justify-center rounded-xl bg-sand/40 py-12">
              <div className="scale-[1.7]">{Art.necklace}</div>
            </div>
            <div>
              <h2 className="font-serif text-[30px] font-medium text-ink">The maker’s hand</h2>
              <p className="mt-4 text-[14px] font-light leading-[1.9] text-mute">
                Yeralis learned the craft the slow way — soldering, stringing and setting stones until
                each piece felt inevitable. Nothing is mass-produced; small batches are finished one at a
                time, so no two are exactly alike.
              </p>
              <p className="mt-4 text-[14px] font-light leading-[1.9] text-mute">
                We work with sterling silver, 14K and 24K gold-fill, hematite, chalcedony, coral and paua
                shell — materials that age gracefully and carry the warmth of the sea.
              </p>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[1100px] px-8 pt-24">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
              <Value art="bracelet" title="Handmade" body="Every piece is made and finished by hand in our Athens atelier." />
              <Value art="shell" title="Natural materials" body="Gemstones, shells and minerals chosen from the Aegean shore." />
              <Value art="ring" title="Made to last" body="Honest materials and careful work, meant to be worn for a lifetime." />
            </div>
          </section>

          <VisitUs />
          <div className="pb-10" />
        </main>
      </StoreShell>
    </div>
  );
}
