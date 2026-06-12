"use client";

// Minimalist header: a three-column row with the wordmark centred (like the
// original), nav left, icons right. Generous height, a single hairline below.
import { useState } from "react";
import { useShop } from "./shop-context";
import { Wordmark } from "./Wordmark";
import { BagIcon, HeartIcon, SearchIcon, CloseIcon } from "./icons";

const NAV = [
  { label: "Shop", href: "#catalog" },
  { label: "Atelier", href: "#atelier" },
];

export function Header() {
  const { count, wishCount, setCartOpen, setWishOpen, query, setQuery } = useShop();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate/10 bg-marble/90 backdrop-blur-md">
      <div className="mx-auto grid h-20 max-w-page grid-cols-[1fr_auto_1fr] items-center px-5 md:px-8">
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="font-ui text-[11px] uppercase tracking-[0.2em] text-ash transition-colors hover:text-slate">{n.label}</a>
          ))}
        </nav>

        <div className="justify-self-start md:justify-self-center">
          <Wordmark />
        </div>

        <div className="flex items-center justify-self-end gap-1 text-slate">
          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Search" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-stone/60">
            {searchOpen ? <CloseIcon size={18} /> : <SearchIcon size={18} />}
          </button>
          <button onClick={() => setWishOpen(true)} aria-label={`Saved (${wishCount})`} className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-stone/60">
            <HeartIcon size={18} />
            {wishCount > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-garnet" />}
          </button>
          <button onClick={() => setCartOpen(true)} aria-label={`Bag (${count})`} className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-stone/60">
            <BagIcon size={18} />
            {count > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-slate text-[9px] font-600 text-marble">{count}</span>}
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
              placeholder="Search by name, stone, or collection…"
              className="w-full bg-transparent py-1 font-ui text-[14px] text-slate placeholder:text-ash/70 focus:outline-none"
            />
            {query && <button onClick={() => setQuery("")} className="font-ui text-[11px] uppercase tracking-[0.18em] text-ash hover:text-slate">Clear</button>}
          </div>
        </div>
      )}
    </header>
  );
}
