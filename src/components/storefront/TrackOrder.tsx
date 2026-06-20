"use client";

import { useState } from "react";
import { eur } from "@/lib/money";
import { ArtBox } from "./product-art";
import type { ClientOrder } from "@/lib/order-serialize";

const chip = (label: string, tone: "green" | "gold" | "grey") =>
  `inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
    tone === "green" ? "bg-emerald-500/12 text-emerald-700" : tone === "gold" ? "bg-gold/15 text-gold" : "bg-ink/8 text-mute"
  }`;
const payTone = (p: string): "green" | "gold" | "grey" =>
  p === "Paid" ? "green" : p === "Awaiting payment" ? "gold" : "grey";
const fulTone = (f: string): "green" | "grey" => (f === "Shipped" || f === "Delivered" ? "green" : "grey");

export function TrackOrder() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<ClientOrder | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const lookup = async () => {
    if (!number.trim() || !email.includes("@") || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/order/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, email }),
      });
      const data = await res.json();
      if (data.ok) setOrder(data.order);
      else {
        setOrder(null);
        setErr(data.error || "Not found");
      }
    } catch {
      setErr("Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const f = "w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-[13.5px] text-ink placeholder:text-mute focus:border-gold focus:outline-none";

  return (
    <main className="mx-auto w-full max-w-[640px] px-8 pb-24 pt-16">
      <header className="mb-8 text-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Order status</div>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight text-ink">Track your order</h1>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] font-light leading-relaxed text-mute">
          Enter your order number (from your confirmation email) and the email you used.
        </p>
      </header>

      <div className="space-y-3">
        <input className={f} placeholder="Order number (e.g. PA-2842)" value={number} onChange={(e) => setNumber(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} />
        <input className={f} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} />
        <button onClick={lookup} disabled={busy} className="w-full rounded-full bg-ink py-3.5 text-[12.5px] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-ink/90 disabled:opacity-60">
          {busy ? "Looking…" : "Find my order"}
        </button>
        {err && <div className="text-center text-[12.5px] text-rose-500">{err}</div>}
      </div>

      {order && (
        <div className="mt-8 rounded-2xl border border-ink/10 bg-paper p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
            <div className="font-serif text-[20px] font-medium text-ink">Order #{order.number}</div>
            <div className="flex items-center gap-2">
              <span className={chip(order.payment, payTone(order.payment))}>{order.payment}</span>
              <span className={chip(order.fulfillment, fulTone(order.fulfillment))}>{order.fulfillment}</span>
            </div>
          </div>
          <div className="divide-y divide-ink/8 py-2">
            {order.lines.map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <ArtBox art={l.art} box="h-12 w-12" scale="scale-[0.36]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{l.name}</div>
                  <div className="text-[11.5px] text-mute">Qty {l.qty}</div>
                </div>
                <span className="text-[12.5px] text-ink">{eur(l.priceEur * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-ink/10 pt-3 text-[14px] font-semibold text-ink">
            <span>Total</span>
            <span>{eur(order.totalEur)}</span>
          </div>
          {order.payment === "Awaiting payment" && (
            <p className="mt-4 rounded-lg bg-gold/12 px-3 py-2.5 text-[12px] font-light text-ink">
              We’re waiting on your bank transfer. Use <span className="font-medium">#{order.number}</span> as the payment reference; we ship as soon as it clears.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
