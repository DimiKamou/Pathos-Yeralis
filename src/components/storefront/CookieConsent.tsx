"use client";

// Lightweight cookie/GDPR consent banner. Stores the choice in localStorage so
// it only shows once. (Alpha: informational — the store uses essential
// localStorage for cart/wishlist; wire analytics gating here later.)
import { useEffect, useState } from "react";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("pathos.cookieConsent")) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);
  const choose = (v: "accepted" | "declined") => {
    try {
      localStorage.setItem("pathos.cookieConsent", v);
    } catch {
      /* ignore */
    }
    setShow(false);
  };
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[55] flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-3xl flex-col items-center gap-3 rounded-2xl border border-ink/10 bg-paper p-4 shadow-[0_24px_60px_-24px_rgba(80,60,30,0.45)] sm:flex-row sm:gap-5">
        <p className="flex-1 text-[12.5px] font-light leading-relaxed text-mute">
          We use essential cookies to run the shop (your bag, saved pieces) and, with your consent, to improve it. See our{" "}
          <a href="/pages/privacy" className="text-gold hover:text-ink">privacy policy</a>.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => choose("declined")} className="rounded-full border border-ink/20 px-4 py-2 text-[12px] font-medium tracking-wide text-ink/80 hover:border-ink hover:text-ink">
            Decline
          </button>
          <button onClick={() => choose("accepted")} className="rounded-full bg-ink px-5 py-2 text-[12px] font-medium uppercase tracking-[0.14em] text-paper hover:bg-ink/90">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
