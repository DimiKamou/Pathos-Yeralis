"use client";

// Primary nav + hover mega-menu — ported from the prototype. Menu now arrives
// via props (filtered to enabled items) instead of PathosStore + storage events.
import { useState } from "react";
import type { MenuItem } from "@/lib/types";
import { slugify } from "@/lib/slug";

// Where each top-level menu item points. Known items get dedicated pages;
// any custom page item falls through to a generic /pages/[id] route.
function menuHref(m: MenuItem): string {
  if (m.type === "collections") return "/collections";
  if (m.id === "about") return "/about";
  if (m.id === "jewelry") return "/shop";
  if (m.type === "sale") return "/shop";
  return `/pages/${m.id}`;
}

export function Nav({ menu, collections }: { menu: MenuItem[]; collections: string[] }) {
  const [open, setOpen] = useState(false);
  const linkCls = "text-[12px] tracking-[0.22em] text-ink/85 hover:text-ink transition-colors";
  const items = menu.filter((m) => m.enabled);
  return (
    <nav className="border-t border-ink/10">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-12 gap-y-3 px-8 py-4">
        {items.map((m) =>
          m.type === "collections" ? (
            <div key={m.id} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
              <a href="/collections" className={linkCls + " flex items-center gap-1.5 uppercase"}>
                {m.label}
              </a>
              {open && (
                <div className="absolute left-1/2 top-[calc(100%+16px)] z-30 w-56 -translate-x-1/2 border border-ink/12 bg-paper py-3 shadow-[0_18px_50px_-24px_rgba(80,60,30,0.35)]">
                  <ul className="flex flex-col">
                    {collections.map((l) => (
                      <li key={l}>
                        <a href={`/collections/${slugify(l)}`} className="block px-6 py-[9px] text-[12.5px] font-light tracking-[0.06em] text-steel hover:bg-ink/[0.03] hover:text-ink/80 transition-colors">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <a key={m.id} href={menuHref(m)} className={linkCls + " flex items-center gap-1.5 uppercase"}>
              {m.type === "sale" && <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>}
              {m.label}
            </a>
          ),
        )}
      </div>
    </nav>
  );
}
