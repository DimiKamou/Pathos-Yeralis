"use client";

// Welcome popup — once per session, carrying the active code. Light card to
// suit the minimalist palette.
import { useEffect, useState } from "react";

const POPUP = { heading: "The Summer Edit", message: "15% off your first order — handmade Aegean pieces, made to last.", code: "AEGEAN15", button: "Shop the offer" };

export function EntryPopup() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("pathos3.popup")) return;
    const t = setTimeout(() => setOpen(true), 1300);
    return () => clearTimeout(t);
  }, []);

  const close = () => { setOpen(false); try { sessionStorage.setItem("pathos3.popup", "1"); } catch { /* ignore */ } };
  const copy = async () => { try { await navigator.clipboard.writeText(POPUP.code); setCopied(true); } catch { /* ignore */ } };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-night/40 backdrop-blur-[2px]" onClick={close} />
      <div className="relative w-full max-w-md border border-slate/10 bg-chalk p-9 text-center shadow-xl">
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 text-ash hover:text-slate">×</button>
        <div className="mx-auto mb-5 h-px w-8 bg-garnet" />
        <h3 className="font-display text-[30px] font-300 text-slate">{POPUP.heading}</h3>
        <p className="mx-auto mt-3 max-w-xs font-ui text-[13px] font-300 leading-relaxed text-ash">{POPUP.message}</p>
        <button onClick={copy} className="mx-auto mt-6 block border border-slate/15 px-6 py-3 hover:border-garnet">
          <span className="block text-[9px] uppercase tracking-[0.28em] text-ash">{copied ? "copied ✓" : "tap to copy"}</span>
          <span className="mt-1 block font-ui text-[18px] font-600 tracking-[0.12em] text-garnet">{POPUP.code}</span>
        </button>
        <a href="#catalog" onClick={close} className="mt-5 block rounded-full bg-slate py-3 font-ui text-[11px] font-500 uppercase tracking-[0.18em] text-marble hover:bg-slate/85">{POPUP.button}</a>
        <button onClick={close} className="mt-3 font-ui text-[11px] tracking-wide text-ash hover:text-slate">No thanks</button>
      </div>
    </div>
  );
}
