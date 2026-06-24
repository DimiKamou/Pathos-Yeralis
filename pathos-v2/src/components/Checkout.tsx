"use client";

// Three-step checkout — contact → payment → review — mirroring the original's
// flow and fields (express pills, card + bank-transfer methods, discount,
// totals, confirmation copy). Demo only: no real Stripe; "paying" just places a
// mock order and clears the bag. Bank details are the placeholder from the
// original DESIGN_NOTES.
import { useState } from "react";
import { eur } from "@/lib/money";
import { CloseIcon } from "./icons";
import { useShop } from "./shop-context";
import { DiscountField } from "./DiscountField";

const BANK = {
  beneficiary: "Yeralis Jewelry P.C.",
  bank: "National Bank of Greece",
  iban: "GR16 0110 1250 0000 0001 2300 695",
  bic: "ETHNGRAA",
};
const COUNTRIES = ["Greece", "Cyprus", "Germany", "France", "Italy", "Netherlands", "Ireland", "United Kingdom", "United States", "Other"];
type Method = "card" | "bank" | "apple" | "google";

const field = "w-full border border-slate/20 bg-chalk px-3.5 py-2.5 font-ui text-[13px] text-slate placeholder:text-ash/70 focus:border-garnet focus:outline-none";
const labelCls = "font-ui text-[10px] uppercase tracking-[0.2em] text-ash";

export function Checkout() {
  const { items, checkout, setCheckout, subtotal, discount, discountAmount, freeShipCode, count, clear } = useShop();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<Method>("card");
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", postcode: "", country: "Greece" });
  const [placed, setPlaced] = useState<null | { id: string; method: Method; name: string; total: number }>(null);
  const [copied, setCopied] = useState(false);

  if (!checkout) return null;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const freeShip = subtotal >= 100 || freeShipCode;
  const shipping = freeShip || subtotal === 0 ? 0 : 6.5;
  const total = Math.max(0, subtotal - discountAmount) + shipping;

  const close = () => { setCheckout(false); setTimeout(() => { setStep(1); setPlaced(null); }, 200); };
  const place = () => {
    const id = "PA-" + Math.floor(100000 + Math.random() * 900000);
    setPlaced({ id, method, name: form.name || "friend", total });
    clear();
  };
  const copyIban = async () => {
    try { await navigator.clipboard.writeText(BANK.iban.replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-marble">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 py-8 md:px-8">
        <div className="flex items-center justify-between">
          <span className="font-display text-[20px] font-700 tracking-[0.3em] text-slate">ΠΑΘΟΣ</span>
          <button onClick={close} aria-label="Close checkout" className="grid h-9 w-9 place-items-center rounded-full text-ash hover:bg-stone/50 hover:text-slate"><CloseIcon size={18} /></button>
        </div>

        {placed ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 h-px w-10 bg-garnet" />
            {placed.method === "bank" ? (
              <>
                <h2 className="font-display text-[30px] font-500 leading-tight text-slate">Almost there, {placed.name}.</h2>
                <p className="mt-4 max-w-md font-ui text-[13.5px] font-300 leading-relaxed text-ash">
                  Order <span className="text-slate">{placed.id}</span> is reserved. Transfer{" "}
                  <span className="text-garnet">{eur(placed.total)}</span> to the IBAN below, using{" "}
                  <span className="text-slate">{placed.id}</span> as the reference.
                </p>
                <div className="mt-6 w-full max-w-sm border border-slate/15 bg-chalk px-5 py-4 text-left font-ui text-[12.5px] text-slate">
                  <div className="flex justify-between py-1"><span className="text-ash">IBAN</span><span>{BANK.iban}</span></div>
                  <div className="flex justify-between py-1"><span className="text-ash">BIC</span><span>{BANK.bic}</span></div>
                  <div className="flex justify-between py-1"><span className="text-ash">Beneficiary</span><span>{BANK.beneficiary}</span></div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-[30px] font-500 leading-tight text-slate">Thank you, {placed.name}.</h2>
                <p className="mt-4 max-w-md font-ui text-[13.5px] font-300 leading-relaxed text-ash">
                  Order <span className="text-slate">{placed.id}</span> is confirmed. A receipt is on its way to your inbox, and your piece will be struck and shipped within a few days.
                </p>
              </>
            )}
            <button onClick={close} className="mt-9 rounded-full bg-slate px-7 py-3 font-ui text-[11px] font-600 uppercase tracking-[0.16em] text-marble hover:bg-slate/90">Back to the shop</button>
          </div>
        ) : count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center text-ash">
            <p className="font-display text-[22px] italic">Your bag is empty.</p>
            <button onClick={close} className="mt-6 rounded-full bg-slate px-7 py-3 font-ui text-[11px] font-600 uppercase tracking-[0.16em] text-marble hover:bg-slate/90">Browse the work</button>
          </div>
        ) : (
          <div className="mt-8">
            {/* step indicator */}
            <div className="mb-8 flex items-center gap-3 font-ui text-[10px] uppercase tracking-[0.2em]">
              {["Contact", "Payment", "Review"].map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <span className={i + 1 <= step ? "text-garnet" : "text-ash"}>{String(i + 1).padStart(2, "0")} {s}</span>
                  {i < 2 && <span className="h-px w-6 bg-slate/20" />}
                </div>
              ))}
            </div>

            {/* STEP 1 — contact & shipping */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
                <h2 className="font-display text-[24px] font-500 text-slate">Where should it travel?</h2>
                <div><label className={labelCls}>Full name</label><input required value={form.name} onChange={set("name")} className={`mt-1.5 ${field}`} /></div>
                <div><label className={labelCls}>Email</label><input required type="email" value={form.email} onChange={set("email")} className={`mt-1.5 ${field}`} /></div>
                <div><label className={labelCls}>Address</label><input required value={form.address} onChange={set("address")} className={`mt-1.5 ${field}`} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>City</label><input required value={form.city} onChange={set("city")} className={`mt-1.5 ${field}`} /></div>
                  <div><label className={labelCls}>Postcode</label><input required value={form.postcode} onChange={set("postcode")} className={`mt-1.5 ${field}`} /></div>
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <select value={form.country} onChange={set("country")} className={`mt-1.5 ${field}`}>
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="!mt-6 w-full rounded-full bg-garnet py-3.5 font-ui text-[11.5px] font-600 uppercase tracking-[0.18em] text-chalk hover:bg-garnet/85">Continue to payment</button>
              </form>
            )}

            {/* STEP 2 — payment */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-[24px] font-500 text-slate">How would you like to pay?</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setMethod("apple"); setStep(3); }} className="rounded-full bg-slate py-3 font-ui text-[12px] font-600 text-marble hover:bg-slate/90"> Pay</button>
                  <button onClick={() => { setMethod("google"); setStep(3); }} className="rounded-full border border-slate/25 py-3 font-ui text-[12px] font-600 text-slate hover:border-slate/50">G Pay</button>
                </div>
                <div className="flex items-center gap-3 font-ui text-[10px] uppercase tracking-[0.2em] text-ash"><span className="h-px flex-1 bg-slate/15" /> or pay another way <span className="h-px flex-1 bg-slate/15" /></div>

                <div className="space-y-3">
                  <label className={`flex cursor-pointer items-center gap-3 border px-4 py-3 ${method === "card" ? "border-garnet bg-garnet/5" : "border-slate/20"}`}>
                    <input type="radio" name="m" checked={method === "card"} onChange={() => setMethod("card")} className="accent-garnet" />
                    <span className="font-ui text-[13px] text-slate">Credit / debit card</span>
                  </label>
                  {method === "card" && (
                    <div className="space-y-3 px-1">
                      <input placeholder="Card number" className={field} />
                      <div className="grid grid-cols-2 gap-3"><input placeholder="MM / YY" className={field} /><input placeholder="CVC" className={field} /></div>
                      <p className="font-ui text-[11px] text-ash">🔒 We never store card numbers.</p>
                    </div>
                  )}

                  <label className={`flex cursor-pointer items-center gap-3 border px-4 py-3 ${method === "bank" ? "border-garnet bg-garnet/5" : "border-slate/20"}`}>
                    <input type="radio" name="m" checked={method === "bank"} onChange={() => setMethod("bank")} className="accent-garnet" />
                    <span className="font-ui text-[13px] text-slate">Bank transfer / deposit</span>
                  </label>
                  {method === "bank" && (
                    <div className="space-y-1 border border-slate/15 bg-chalk px-4 py-3 font-ui text-[12.5px] text-slate">
                      <div className="flex justify-between py-1"><span className="text-ash">Beneficiary</span><span>{BANK.beneficiary}</span></div>
                      <div className="flex justify-between py-1"><span className="text-ash">Bank</span><span>{BANK.bank}</span></div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-ash">IBAN</span>
                        <span className="flex items-center gap-2">{BANK.iban}<button onClick={copyIban} className="text-[11px] uppercase tracking-[0.14em] text-garnet hover:text-slate">{copied ? "Copied" : "Copy"}</button></span>
                      </div>
                      <div className="flex justify-between py-1"><span className="text-ash">BIC</span><span>{BANK.bic}</span></div>
                      <p className="pt-2 text-[11px] text-ash">Use your order number as the payment reference.</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate/10 pt-4"><DiscountField /></div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="rounded-full border border-slate/25 px-6 py-3 font-ui text-[11.5px] uppercase tracking-[0.16em] text-slate hover:border-slate/50">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 rounded-full bg-garnet py-3.5 font-ui text-[11.5px] font-600 uppercase tracking-[0.18em] text-chalk hover:bg-garnet/85">Review order</button>
                </div>
              </div>
            )}

            {/* STEP 3 — review */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-[24px] font-500 text-slate">One last look.</h2>
                <div className="divide-y divide-slate/10 border-y border-slate/10">
                  {items.map((it) => (
                    <div key={it.key} className="flex justify-between py-3 font-ui text-[13px]">
                      <span className="text-slate">{it.name} {it.variant && <span className="text-ash">· {it.variant}</span>} <span className="text-ash">×{it.qty}</span></span>
                      <span className="text-slate">{eur(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-ui text-[13px] text-ash"><span>Subtotal</span><span className="text-slate">{eur(subtotal)}</span></div>
                  {discount && discountAmount > 0 && <div className="flex justify-between font-ui text-[13px] text-garnet"><span>Discount ({discount.code})</span><span>−{eur(discountAmount)}</span></div>}
                  <div className="flex justify-between font-ui text-[13px] text-ash"><span>Shipping</span><span className="text-slate">{shipping === 0 ? "Free" : eur(shipping)}</span></div>
                  <div className="flex justify-between border-t border-slate/10 pt-2 font-ui text-[15px] font-600 text-slate"><span>Total</span><span className="text-garnet">{eur(total)}</span></div>
                </div>
                <p className="font-ui text-[11.5px] text-ash">Paying with {method === "bank" ? "bank transfer" : method === "apple" ? "Apple Pay" : method === "google" ? "Google Pay" : "card"} · shipping to {form.city || "—"}, {form.country}.</p>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="rounded-full border border-slate/25 px-6 py-3 font-ui text-[11.5px] uppercase tracking-[0.16em] text-slate hover:border-slate/50">Back</button>
                  <button onClick={place} className="flex-1 rounded-full bg-garnet py-3.5 font-ui text-[11.5px] font-600 uppercase tracking-[0.18em] text-chalk hover:bg-garnet/85">
                    {method === "bank" ? "Confirm order" : `Pay ${eur(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
