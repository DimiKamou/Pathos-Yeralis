"use client";

import { useState } from "react";
import { Wordmark } from "./Wordmark";
import { ArrowIcon } from "./icons";

const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Shop", links: ["New In", "Bestsellers", "Collections", "Gift Cards", "Sale"] },
  { title: "About", links: ["Our Story", "The Atelier", "Sustainability", "Journal", "Stockists"] },
  { title: "Help", links: ["Contact Us", "Shipping & Returns", "Care Guide", "Size Guide", "FAQ"] },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="border-t border-slate/10 bg-marble">
      <div className="mx-auto max-w-page px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="inline-block"><Wordmark /></div>
            <p className="mt-5 max-w-xs font-ui text-[12.5px] font-300 leading-relaxed text-ash">
              Handmade jewelry from the Aegean — gemstones, shells and minerals
              shaped into pieces made to last a lifetime.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setDone(true); }} className="mt-7 max-w-xs">
              <label className="font-ui text-[10px] uppercase tracking-[0.22em] text-ash">Letters from the studio</label>
              {done ? (
                <p className="mt-3 font-display text-[16px] italic text-slate">Thank you — we&rsquo;ll be in touch.</p>
              ) : (
                <div className="mt-3 flex items-center border-b border-slate/20 focus-within:border-garnet">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" className="w-full bg-transparent py-2 font-ui text-[13px] text-slate placeholder:text-ash/60 focus:outline-none" />
                  <button type="submit" aria-label="Subscribe" className="grid h-8 w-8 place-items-center text-ash hover:text-slate"><ArrowIcon size={16} /></button>
                </div>
              )}
            </form>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-ui text-[10px] uppercase tracking-[0.26em] text-ash">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="font-ui text-[12.5px] text-slate/80 transition-colors hover:text-garnet">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-slate/10 pt-6 sm:flex-row sm:items-center">
          <span className="font-ui text-[11px] tracking-wide text-ash">© {new Date().getFullYear()} PATHOS by Yeralis · Athens, Greece</span>
          <div className="flex items-center gap-5 font-ui text-[11px] uppercase tracking-[0.16em] text-ash">
            <a href="https://www.instagram.com/pathos_by_yeralis/" className="hover:text-garnet">Instagram</a>
            <a href="#" className="hover:text-garnet">Terms</a>
            <a href="#" className="hover:text-garnet">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
