"use client";

// Welcome popup — appears once per session after a short delay and carries the
// active discount code, as in the original. Reskinned to the night/garnet card.
import { useEffect, useState } from "react";

const POPUP = { heading: "The Summer Edit is here", message: "Enjoy 15% off your first order — handmade Aegean pieces, made to last.", code: "AEGEAN15", button: "Shop the offer" };

export function EntryPopup() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("pathos2.popup")) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const close = () => { setOpen(false); try { sessionStorage.setItem("pathos2.popup", "1"); } catch { /* ignore */ } };
  const copy = async () => { try { await navigator.clipboard.writeText(POPUP.code); setCopied(true); } catch { /* ignore */ } };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-night/60 backdrop-blur-[2px]" onClick={close} />
      <div className="relative w-full max-w-md overflow-hidden border border-garnet/25 bg-night p-9 text-center text-marble shadow-2xl">
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 text-stone/60 hover:text-marble">×</button>
        <div className="mx-auto mb-5 h-px w-8 bg-garnet" />
        <h3 className="font-display text-[30px] font-500 leading-tight text-marble">{POPUP.heading}</h3>
        <p className="mx-auto mt-3 max-w-xs font-ui text-[13px] font-300 leading-relaxed text-stone">{POPUP.message}</p>
        <button onClick={copy} className="mx-auto mt-6 block border border-marble/20 bg-marble/5 px-6 py-3 font-ui tracking-[0.26em] text-marble hover:border-garnet">
          <span className="text-[10px] uppercase tracking-[0.3em] text-stone">{copied ? "copied ✓" : "tap to copy"}</span>
          <span className="mt-1 block text-[18px] font-600">{POPUP.code}</span>
        </button>
        <a href="#feelings" onClick={close} className="mt-5 block rounded-full bg-garnet py-3 font-ui text-[11px] font-600 uppercase tracking-[0.18em] text-chalk hover:bg-garnet/85">{POPUP.button}</a>
        <button onClick={close} className="mt-3 font-ui text-[11px] tracking-wide text-stone/60 hover:text-stone">No thanks</button>
      </div>
    </div>
  );
}
