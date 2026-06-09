"use client";

// Index of all collections — a grid of cards linking to each collection page.
import { useShop } from "./shop-context";
import { Art } from "./art";
import { slugify } from "@/lib/slug";

export function CollectionsIndex({ collections }: { collections: string[] }) {
  const { products } = useShop();
  const active = products.filter((p) => p.status === "Active");

  const countFor = (label: string) =>
    label.toLowerCase() === "new in"
      ? active.length
      : active.filter((p) => slugify(p.collection) === slugify(label)).length;
  const motifFor = (label: string) => {
    const sample = active.find((p) => slugify(p.collection) === slugify(label));
    return Art[sample?.art ?? "necklace"] ?? Art.necklace;
  };

  return (
    <main className="mx-auto w-full max-w-[1240px] px-8 pb-12 pt-14">
      <header className="mb-12 text-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Explore</div>
        <h1 className="mt-2 font-serif text-[40px] font-medium leading-tight tracking-[0.02em] text-ink">Collections</h1>
        <p className="mx-auto mt-3 max-w-xl text-[13.5px] font-light leading-relaxed tracking-wide text-mute">
          Soulful, handmade jewelry inspired by the Aegean — gemstones, shells &amp; minerals drawn from the natural beauty of the earth.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((label) => {
          const n = countFor(label);
          return (
            <a
              key={label}
              href={`/collections/${slugify(label)}`}
              className="group relative block aspect-[5/4] overflow-hidden bg-sand"
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
                <div className="scale-[1.4]">{motifFor(label)}</div>
              </div>
              <div className="absolute left-7 top-7">
                <div className="font-serif text-[26px] font-medium tracking-[0.04em] text-ink">{label}</div>
                <div className="mt-1 text-[12.5px] font-light tracking-wide text-ink/55">
                  {n} piece{n === 1 ? "" : "s"}
                </div>
              </div>
              <span className="absolute bottom-7 left-7 text-[11px] tracking-[0.25em] text-ink/0 transition-colors group-hover:text-ink/70">
                VIEW →
              </span>
            </a>
          );
        })}
      </div>
    </main>
  );
}
