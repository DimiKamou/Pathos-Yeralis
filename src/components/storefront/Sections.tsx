"use client";

// Storefront sections: Shop-by-Collection grid, the Handmade Favorites carousel,
// and the free-shipping promo strip. Ported from the prototype; CATALOG now
// reads from useShop(), and product art is photo-aware.
import { useRef, type ReactNode } from "react";
import { HeartIcon, ChevronL, ChevronR } from "./icons";
import { Art } from "./art";
import { ProductMedia } from "./product-art";
import { useShop } from "./shop-context";
import { eur } from "@/lib/money";
import type { StoreProduct } from "@/lib/types";

const GOLD = "#a9824a";

/* ───────────────────────── Shop by Collection ───────────────────────── */
function CollectionCard({ tone, eyebrow, label, motif, href = "#" }: { tone: "light" | "dark"; eyebrow: string; label: string; motif: ReactNode; href?: string }) {
  const dark = tone === "dark";
  return (
    <a href={href} className={`group relative block aspect-[5/4] overflow-hidden ${dark ? "bg-[#2b2620]" : "bg-sand"}`}>
      {/* faint product motif */}
      <div className={`pointer-events-none absolute inset-0 flex items-center justify-center ${dark ? "opacity-25" : "opacity-40"}`}>{motif}</div>
      <div className="absolute left-7 top-7">
        <div className={`font-serif text-[28px] font-medium tracking-[0.06em] ${dark ? "text-[#f3ead9]" : "text-ink"}`}>{eyebrow}</div>
        <div className={`mt-1 text-[13px] font-light tracking-wide ${dark ? "text-white/70" : "text-ink/55"}`}>{label}</div>
      </div>
      <span
        className={`absolute bottom-7 left-7 text-[11px] tracking-[0.25em] ${dark ? "text-white/0 group-hover:text-white/80" : "text-ink/0 group-hover:text-ink/70"} transition-colors`}
      >
        VIEW →
      </span>
    </a>
  );
}

export function ShopByCollection() {
  const beadsMotif = (light: boolean) => (
    <svg viewBox="0 0 320 240" className="h-3/5 w-auto" fill="none" stroke={light ? GOLD : "#e7d9bf"} strokeWidth="2" strokeLinecap="round">
      <path d="M30 96 Q160 168 290 96" opacity="0.5" />
      {Array.from({ length: 13 }).map((_, i) => {
        const t = i / 12;
        const x = 30 + t * 260;
        const y = 96 + Math.sin(Math.PI * t) * 70;
        return <circle key={i} cx={x} cy={y} r={i % 2 ? 11 : 8} />;
      })}
    </svg>
  );
  const gemMotif = (
    <svg viewBox="0 0 240 300" className="h-3/5 w-auto" fill="none" stroke="#e7d9bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M120 40 l44 38 -44 150 -44 -150 z" />
      <path d="M76 78 h88 M120 40 v188 M98 78 l22 150 M142 78 l-22 150" opacity="0.55" />
    </svg>
  );
  return (
    <section className="mx-auto w-full max-w-[1240px] px-8 pb-4 pt-24">
      <header className="mb-12 text-center">
        <h2 className="font-serif text-[40px] font-medium leading-tight tracking-[0.02em] text-ink">Explore the Collections</h2>
        <p className="mx-auto mt-3 max-w-xl text-[13.5px] font-light leading-relaxed tracking-wide text-mute">
          Soulful, handmade jewelry inspired by the Aegean &mdash; gemstones, shells &amp; minerals drawn from the natural beauty of the earth.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <CollectionCard tone="light" eyebrow="Aegean" label="Shop the Sea Collection" motif={beadsMotif(true)} href="/collections/aegean" />
        <CollectionCard tone="dark" eyebrow="Hematite" label="Shop Hematite" motif={gemMotif} href="/collections/hematite" />
      </div>
    </section>
  );
}

/* ───────────────────────── Product carousel ───────────────────────── */
function Swatches({ colors }: { colors: string[] }) {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {colors.map((c, i) => (
        <span key={i} className="h-3 w-3 rounded-full ring-1 ring-ink/15" style={{ background: c }} />
      ))}
    </div>
  );
}

export function ProductCard({ p }: { p: StoreProduct }) {
  const { setPdp, toggleWish, inWish } = useShop();
  const sold = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 5;
  const saved = inWish(p.id);
  return (
    <div className="group w-[200px] shrink-0">
      <button onClick={() => setPdp(p)} className="relative flex h-[210px] w-full items-center justify-center bg-paper">
        {sold && <span className="absolute right-2 top-2 bg-[#d8cdba] px-2 py-[3px] text-[10px] font-medium tracking-wide text-[#6b5f4d]">Sold Out</span>}
        {low && <span className="absolute right-2 top-2 bg-gold/90 px-2 py-[3px] text-[10px] font-medium tracking-wide text-paper">Only {p.stock} left</span>}
        {p.imageUrl ? (
          <ProductMedia
            art={p.art}
            imageUrl={p.imageUrl}
            alt={p.name}
            imgClass="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="transition-transform duration-300 group-hover:scale-105">{Art[p.art]}</span>
        )}
      </button>
      <div className="mt-3 flex items-start justify-between">
        <button onClick={() => setPdp(p)} className="text-left text-[13px] tracking-wide text-ink transition-colors hover:text-gold">
          {p.name}
        </button>
        <button
          onClick={() => toggleWish(p.id)}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          className={`mt-0.5 transition-colors ${saved ? "text-gold" : "text-mute hover:text-ink"}`}
        >
          <HeartIcon size={15} filled={saved} />
        </button>
      </div>
      <div className="mt-1 text-[12.5px] font-light tracking-wide text-mute">{eur(p.price)}</div>
      <Swatches colors={p.swatches} />
    </div>
  );
}

export function Carousel() {
  const { products } = useShop();
  const trackRef = useRef<HTMLDivElement>(null);
  const active = products.filter((p) => p.status === "Active");
  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * 460, behavior: "smooth" });
  };
  return (
    <section className="mx-auto w-full max-w-[1240px] px-8 pb-8 pt-24">
      <h2 className="mb-12 text-center font-serif text-[28px] font-medium tracking-[0.12em] text-ink">Handmade Favorites</h2>
      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className="absolute -left-2 top-[100px] z-10 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
        >
          <ChevronL size={30} w={1.2} />
        </button>
        <button
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className="absolute -right-2 top-[100px] z-10 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
        >
          <ChevronR size={30} w={1.2} />
        </button>
        <div ref={trackRef} className="no-scrollbar flex gap-8 overflow-x-auto scroll-smooth px-6 pb-2">
          {active.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Footer promo ───────────────────────── */
export function Promo() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-8 pb-16 pt-10">
      <div className="flex items-center gap-7">
        <span className="h-px flex-1 bg-ink/15" />
        <span className="text-center text-[12.5px] font-medium tracking-[0.22em] text-ink">FREE SHIPPING ACROSS GREECE &amp; THE EU FOR ORDERS ABOVE 100€</span>
        <span className="h-px flex-1 bg-ink/15" />
      </div>
    </section>
  );
}
