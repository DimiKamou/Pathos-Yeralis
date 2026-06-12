"use client";

// Sold-out capture, shown in place of Add-to-cart for claimed pieces.
import { useState } from "react";

export function NotifyForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="mt-6 border border-patina/30 bg-patina/5 px-4 py-4 font-ui text-[12.5px] text-slate">
        We&rsquo;ll write to <span className="font-600">{email}</span> the moment another is made.
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setDone(true); }} className="mt-6">
      <div className="font-ui text-[11px] uppercase tracking-[0.16em] text-ash">Claimed — be first when it returns</div>
      <div className="mt-3 flex items-center border-b border-slate/20 focus-within:border-garnet">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email"
          className="w-full bg-transparent py-2 font-ui text-[13px] text-slate placeholder:text-ash/70 focus:outline-none"
        />
        <button type="submit" className="shrink-0 px-2 font-ui text-[11px] uppercase tracking-[0.16em] text-garnet hover:text-slate">Notify me</button>
      </div>
    </form>
  );
}
