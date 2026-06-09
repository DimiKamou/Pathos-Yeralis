"use client";

// Entry popup (admin-controlled). Ported from the prototype; `popup` is now a
// prop (sourced from DB settings) instead of PathosStore.load('popup').
import { useEffect, useState } from "react";
import type { PopupSetting } from "@/lib/types";
import { Art } from "@/components/storefront/art";

export function EntryPopup({ popup }: { popup: PopupSetting }) {
  const [p] = useState<PopupSetting>(popup);
  const [show, setShow] = useState(false);
  const [entered, setEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!p.enabled) return;
    if (p.frequency === "session" && sessionStorage.getItem("pathos.popupSeen")) return;
    const t = setTimeout(() => setShow(true), Math.max(0, (p.delay || 0) * 1000));
    return () => clearTimeout(t);
  }, [p]);
  useEffect(() => {
    if (show) {
      const r = setTimeout(() => setEntered(true), 30);
      return () => clearTimeout(r);
    }
  }, [show]);
  const close = () => {
    setShow(false);
    try {
      sessionStorage.setItem("pathos.popupSeen", "1");
    } catch {
      /* ignore */
    }
  };
  const copy = () => {
    try {
      navigator.clipboard.writeText(p.code);
    } catch {
      /* ignore */
    }
    setCopied(true);
  };
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className={`absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${entered ? "opacity-100" : "opacity-0"}`} onClick={close}></div>
      <div className={`relative w-full max-w-md overflow-hidden rounded-[20px] bg-[#2a241e] p-9 text-center shadow-2xl ring-1 ring-gold/15 transition-all duration-500 ease-[cubic-bezier(.16,.84,.44,1)] motion-reduce:transition-none ${entered ? "opacity-100 translate-y-0 scale-100" : "translate-y-4 scale-95 opacity-0"}`}>
        {/* layered ambience */}
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: "radial-gradient(125% 85% at 50% -5%, rgba(201,158,96,.6), transparent 62%)" }}></div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="pp-sheen absolute -inset-y-6 left-0 w-1/3" style={{ background: "linear-gradient(90deg, transparent, rgba(201,158,96,.13), transparent)" }}></div>
        </div>
        {/* drifting line-art jewelry */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="pp-floatA absolute -left-10 top-6 opacity-[0.13]">{Art.ring}</div>
          <div className="pp-floatB absolute -right-12 top-1 opacity-[0.12]">{Art.drop}</div>
          <div className="pp-floatA absolute -right-8 -bottom-4 opacity-[0.11]" style={{ animationDelay: "1.6s" }}>{Art.shell}</div>
          <div className="pp-floatB absolute -left-8 -bottom-6 opacity-[0.10]" style={{ animationDelay: "2.4s" }}>{Art.bracelet}</div>
        </div>

        <button onClick={close} className="absolute right-4 top-4 z-10 text-[#f3ead9]/50 hover:text-[#f3ead9]" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>

        <div className="relative">
          <div className="text-[10px] font-medium uppercase tracking-[0.34em] text-gold">PATHOS · by Yeralis</div>
          <div className="mx-auto mt-3 mb-1 flex items-center justify-center gap-2 text-gold/70">
            <span className="h-px w-9 bg-gold/35"></span>
            <span className="text-[7px] leading-none">◆</span>
            <span className="h-px w-9 bg-gold/35"></span>
          </div>
          <h3 className="font-serif text-[32px] font-medium leading-tight text-[#f3ead9]">{p.heading}</h3>
          <p className="mx-auto mt-3 max-w-xs text-[13.5px] font-light leading-relaxed text-[#f3ead9]/75">{p.message}</p>

          {p.code && (
            <div className="relative mx-auto mt-7 w-fit">
              {/* jump ring the tag hangs from */}
              <div className="mx-auto h-3.5 w-3.5 rounded-full border-[1.5px] border-gold/80"></div>
              <button onClick={copy} title="Tap to copy"
                className="pp-swing group relative -mt-[3px] block px-10 pb-4 pt-5 shadow-[0_12px_24px_-12px_rgba(0,0,0,.7)] transition-transform active:scale-[.98]"
                style={{ background: "linear-gradient(155deg,#f3ead9,#e2d4ba)", clipPath: "polygon(50% 0, 100% 14%, 100% 100%, 0 100%, 0 14%)" }}>
                {/* punched hole showing the dark card behind */}
                <span className="absolute left-1/2 top-[9px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#2a241e] ring-1 ring-black/20"></span>
                <span className="mt-3 block text-[9px] font-semibold uppercase tracking-[0.3em] text-[#9a7b46]">Welcome gift</span>
                <span className="mt-1.5 block font-mono text-[20px] font-medium tracking-[0.26em] text-[#2a241e]">{copied ? "Copied ✓" : p.code}</span>
                <span className="mt-1 block text-[9px] uppercase tracking-[0.18em] text-[#2a241e]/45">{copied ? "applied at checkout" : "tap to copy"}</span>
              </button>
            </div>
          )}

          <button onClick={close} className="mt-7 whitespace-nowrap rounded-full bg-gold px-9 py-3 text-[12.5px] font-medium tracking-wide text-white shadow-lg shadow-gold/20 transition-colors hover:bg-gold/90">{p.button}</button>
          <button onClick={close} className="mt-3 block w-full text-[11px] tracking-wide text-[#f3ead9]/45 hover:text-[#f3ead9]/70">No thanks</button>
        </div>
      </div>
    </div>
  );
}
