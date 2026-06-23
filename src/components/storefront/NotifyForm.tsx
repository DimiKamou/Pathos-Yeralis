"use client";

// Back-in-stock capture shown in the PDP for sold-out pieces. Ported from the
// prototype; now writes a real subscriber via /api/subscribe.
import { useState } from "react";
import { BellIcon } from "./icons";

export function NotifyForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = async () => {
    if (!email.includes("@")) return;
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "Back-in-stock" }),
      });
    } catch {
      /* ignore */
    }
    setDone(true);
  };
  if (done)
    return (
      <div className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gold/12 py-3.5 text-[12.5px] font-light text-gold">
        <BellIcon size={16} /> We’ll email you the moment it’s back.
      </div>
    );
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-ink">
        <BellIcon size={16} className="text-gold" /> Notify me when it’s back in stock
      </div>
      <div className="flex items-center gap-2 rounded-full border border-ink/20 py-1 pl-4 pr-1">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Your email"
          className="w-full bg-transparent text-[13px] font-light text-ink placeholder:text-mute focus:outline-none"
        />
        <button
          onClick={submit}
          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink/90"
        >
          Notify me
        </button>
      </div>
    </div>
  );
}
