"use client";

// Sticky storefront header: wordmark · feeling-led nav · search/wishlist/bag.
import { useState } from "react";
import { useShop } from "./shop-context";
import { Wordmark } from "./Wordmark";
import { BagIcon, HeartIcon, SearchIcon, CloseIcon } from "./icons";

const NAV = [
  { label: "Feelings", href: "#feelings" },
  { label: "The work", href: "#manifesto" },
  { label: "Atelier", href: "#atelier" },
];

export function Header() {
  const { count, wishCount, setCartOpen, setWishOpen, query, setQuery } = useShop();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate/10 bg-marble/85 backdrop-blur-md">
      <div className="mx-auto flex h-[70px] max-w-page items-center justify-between gap-6 px-5 md:px-8">
        <Wordmark />

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="relative font-ui text-[11px] uppercase tracking-[0.22em] text-ash transition-colors hover:text-slate">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 text-slate">
          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Search" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-stone/50">
            {searchOpen ? <CloseIcon size={18} /> : <SearchIcon size={18} />}
          </button>
          <button onClick={() => setWishOpen(true)} aria-label={`Saved pieces (${wishCount})`} className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-stone/50">
            <HeartIcon size={18} />
            {wishCount > 0 && <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-garnet text-[9px] font-600 text-chalk">{wishCount}</span>}
          </button>
          <button onClick={() => setCartOpen(true)} aria-label={`Your bag (${count})`} className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-stone/50">
            <BagIcon size={18} />
            {count > 0 && <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-garnet text-[9px] font-600 text-chalk">{count}</span>}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-slate/10 bg-marble">
          <div className="mx-auto flex max-w-page items-center gap-3 px-5 py-3 md:px-8">
            <SearchIcon size={18} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, stone, or feeling…"
              className="w-full bg-transparent py-1 font-ui text-[14px] text-slate placeholder:text-ash/70 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="font-ui text-[11px] uppercase tracking-[0.18em] text-ash hover:text-slate">
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
