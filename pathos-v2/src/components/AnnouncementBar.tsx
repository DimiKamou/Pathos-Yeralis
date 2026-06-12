"use client";

import { useState } from "react";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="bg-night text-marble">
      <div className="relative mx-auto flex max-w-page items-center justify-center px-5 py-2 md:px-8">
        <p className="text-center font-ui text-[10px] uppercase tracking-[0.24em] text-stone">
          Free shipping across Greece &amp; the EU on orders over €100
        </p>
        <button onClick={() => setOpen(false)} aria-label="Dismiss" className="absolute right-4 font-ui text-[12px] text-stone hover:text-marble">×</button>
      </div>
    </div>
  );
}
