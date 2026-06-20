"use client";

// A single collection's filtered product grid. Lives inside StoreShell, so the
// PDP modal, cart and checkout all work from here.
import { useState } from "react";
import { ProductCard, Promo } from "./Sections";
import type { StoreProduct } from "@/lib/types";

export function CollectionView({
  label,
  sub,
  products,
  top = false,
  eyebrow = "Collection",
}: {
  label: string;
  sub?: string;
  products: StoreProduct[];
  top?: boolean;
  eyebrow?: string;
}) {
  const [sort, setSort] = useState("featured");
  const shown = [...products];
  if (sort === "price-asc") shown.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") shown.sort((a, b) => b.price - a.price);
  else if (sort === "name") shown.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <main className="mx-auto w-full max-w-[1240px] px-8 pb-8 pt-14">
      <nav className="mb-8 text-center text-[11px] font-light tracking-[0.06em] text-mute">
        <a href="/" className="hover:text-ink">Home</a>
        <span className="px-2 text-mute/60">/</span>
        {!top && (
          <>
            <a href="/collections" className="hover:text-ink">Collections</a>
            <span className="px-2 text-mute/60">/</span>
          </>
        )}
        <span className="text-ink">{label}</span>
      </nav>
      <header className="mb-12 text-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">{eyebrow}</div>
        <h1 className="mt-2 font-serif text-[40px] font-medium leading-tight tracking-[0.02em] text-ink">{label}</h1>
        <p className="mx-auto mt-3 max-w-xl text-[13.5px] font-light leading-relaxed tracking-wide text-mute">
          {sub ?? `${products.length} piece${products.length === 1 ? "" : "s"}, handmade in our Pláka atelier.`}
        </p>
      </header>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="font-serif text-[22px] text-ink">New pieces are on the way</div>
          <p className="mt-2 max-w-sm text-[13px] font-light text-mute">This collection doesn’t have any pieces yet — check back soon.</p>
          <a href="/" className="mt-5 rounded-full bg-ink px-6 py-2.5 text-[12px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90">
            Browse the shop
          </a>
        </div>
      ) : (
        <>
          {products.length > 1 && (
            <div className="mb-6 flex items-center justify-end gap-2 text-[12px]">
              <span className="text-mute">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-ink/15 bg-paper px-3 py-1.5 text-[12.5px] text-ink focus:border-gold focus:outline-none">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}

      <Promo />
    </main>
  );
}
