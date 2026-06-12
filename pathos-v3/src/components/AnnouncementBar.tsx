"use client";

import { useState } from "react";

// A single thin dark sliver — the one dark accent in an otherwise light design,
// a quiet nod to the original's announcement bar.
export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="bg-night text-marble">
      <div className="relative mx-auto max-w-page px-6 py-1.5 text-center">
        <p className="font-ui text-[9px] uppercase tracking-[0.32em] text-marble/80">Free shipping · Greece &amp; the EU over €100</p>
        <button onClick={() => setOpen(false)} aria-label="Dismiss" className="absolute right-4 top-1/2 -translate-y-1/2 text-marble/50 hover:text-marble">×</button>
      </div>
    </div>
  );
}
