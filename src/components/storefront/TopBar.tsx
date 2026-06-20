"use client";

// Top bar — brand mark, live search, theme toggle, and account/wishlist/cart
// icons. Ported from the prototype; CATALOG references now read from useShop().
import { useState } from "react";
import { SearchIcon, UserIcon, HeartIcon, BagIcon, SunIcon, MoonIcon } from "./icons";
import { ArtBox } from "./product-art";
import { useShop } from "./shop-context";
import { eur } from "@/lib/money";
import type { StoreProduct } from "@/lib/types";

function Logo() {
  return (
    <a href="/" className="flex flex-col items-center select-none" aria-label="Pathos home">
      <svg width="30" height="24" viewBox="0 0 30 24" fill="none" aria-hidden="true" className="mb-1">
        <path d="M6 2 H24 L28 8 L15 22 L2 8 Z" stroke="#b1894e" strokeWidth="1" strokeLinejoin="round" />
        <path d="M2 8 H28 M11 2 L8 8 L15 22 M19 2 L22 8 L15 22" stroke="#b1894e" strokeWidth="0.8" strokeLinejoin="round" />
      </svg>
      <span className="font-serif text-[26px] font-medium leading-none tracking-[0.34em] text-ink pl-[0.34em]">PATHOS</span>
      <span className="mt-1 font-serif text-[12px] italic tracking-[0.12em] text-gold">by Yeralis</span>
    </a>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("pathos.theme") === "dark";
    } catch {
      return false;
    }
  });
  const toggle = () =>
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("pathos.theme", next ? "dark" : "light");
      } catch {
        /* ignore */
      }
      return next;
    });
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="p-1 text-ink/80 hover:text-ink transition-colors">
      {dark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
    </button>
  );
}

function IconBadge({ children, count, onClick }: { children: React.ReactNode; count?: number; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="relative p-1 text-ink/80 hover:text-ink transition-colors">
      {children}
      {count != null && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-[3px] text-[9px] font-medium leading-none text-paper">
          {count}
        </span>
      )}
    </button>
  );
}

// Live-results dropdown shared by the desktop bar and the mobile search row.
function SearchResults({
  results,
  query,
  onPick,
  className = "",
}: {
  results: StoreProduct[];
  query: string;
  onPick: (p: StoreProduct) => void;
  className?: string;
}) {
  return (
    <div
      className={`z-40 overflow-hidden rounded-xl border border-ink/12 bg-paper py-2 shadow-[0_24px_60px_-24px_rgba(80,60,30,0.4)] ${className}`}
    >
      {results.length === 0 ? (
        <div className="px-4 py-5 text-center text-[12.5px] font-light text-mute">No pieces match “{query.trim()}”</div>
      ) : (
        results.map((p) => (
          <button
            key={p.id}
            onMouseDown={() => onPick(p)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-ink/[0.03]"
          >
            <ArtBox art={p.art} imageUrl={p.imageUrl} box="h-11 w-11" scale="scale-[0.34]" alt={p.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-ink">{p.name}</span>
              <span className="block text-[11px] font-light text-mute">{p.collection}</span>
            </span>
            <span className="text-[12.5px] font-light text-mute">{eur(p.price)}</span>
          </button>
        ))
      )}
    </div>
  );
}

export function TopBar() {
  const { products, count, setCartOpen, wishCount, setWishOpen, query, setQuery, setPdp } = useShop();
  const [focus, setFocus] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const q = query.trim().toLowerCase();
  const results = q
    ? products
        .filter(
          (p) =>
            p.status === "Active" &&
            (p.name.toLowerCase().includes(q) || p.collection.toLowerCase().includes(q) || (p.material || "").toLowerCase().includes(q)),
        )
        .slice(0, 6)
    : [];
  const openResult = (p: StoreProduct) => {
    setPdp(p);
    setQuery("");
    setFocus(false);
    setMobileOpen(false);
  };
  return (
    <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-7">
      {/* search — desktop */}
      <div className="hidden md:block">
        <div className="relative max-w-[260px]">
          <div className="flex items-center gap-2 border-b border-ink/20 pb-1.5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              placeholder="Search anything…"
              className="w-full bg-transparent text-[13px] font-light tracking-wide text-ink placeholder:text-mute/80 focus:outline-none"
            />
            <SearchIcon size={17} className="shrink-0 text-mute" />
          </div>
          {focus && q && <SearchResults results={results} query={query} onPick={openResult} className="absolute left-0 top-[calc(100%+10px)] w-[320px]" />}
        </div>
      </div>
      {/* search — mobile toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close search" : "Search"}
          aria-expanded={mobileOpen}
          className="p-1 text-ink/80 hover:text-ink transition-colors"
        >
          <SearchIcon size={20} />
        </button>
      </div>
      {/* logo */}
      <div className="flex justify-center md:col-start-2">
        <Logo />
      </div>
      {/* account icons */}
      <div className="col-start-3 flex items-center justify-end gap-5">
        <ThemeToggle />
        <IconBadge>
          <UserIcon size={20} />
        </IconBadge>
        <IconBadge count={wishCount} onClick={() => setWishOpen(true)}>
          <HeartIcon size={20} />
        </IconBadge>
        <IconBadge count={count} onClick={() => setCartOpen(true)}>
          <BagIcon size={20} />
        </IconBadge>
      </div>
      {/* search — mobile full-width row under the bar */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-ink/20 bg-paper px-8 pb-4 md:hidden">
          <div className="relative">
            <div className="flex items-center gap-2 border-b border-ink/20 pb-1.5">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocus(true)}
                onBlur={() => setTimeout(() => setFocus(false), 150)}
                placeholder="Search anything…"
                autoFocus
                className="w-full bg-transparent text-[13px] font-light tracking-wide text-ink placeholder:text-mute/80 focus:outline-none"
              />
              <SearchIcon size={17} className="shrink-0 text-mute" />
            </div>
            {q && <SearchResults results={results} query={query} onPick={openResult} className="absolute left-0 right-0 top-[calc(100%+10px)]" />}
          </div>
        </div>
      )}
    </div>
  );
}
