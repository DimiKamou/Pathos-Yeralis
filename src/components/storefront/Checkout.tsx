"use client";

// 3-step checkout (Details → Payment → Review) ported from the prototype, with
// the demo card fields replaced by Stripe's Payment Element, Apple/Google Pay
// via the Payment Request Button, and the manual bank-transfer flow. All money
// is recomputed server-side; this component only displays + collects.
import { useEffect, useRef, useState } from "react";
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";
import { useShop } from "./shop-context";
import { eur } from "@/lib/money";
import { ArtBox } from "./product-art";
import { DiscountField } from "./DiscountField";
import { getStripePromise, elementsAppearance } from "./stripe-client";
import { BankIcon, CardIcon, CloseIcon, CopyIcon, LockIcon } from "./icons";
import type { BankDetails } from "@/lib/bank";
import type { CommerceSetting } from "@/lib/types";
import type { ClientOrder } from "@/lib/order-serialize";

const COUNTRY_CODE: Record<string, string> = {
  Greece: "GR",
  Germany: "DE",
  France: "FR",
  Italy: "IT",
  Ireland: "IE",
  Netherlands: "NL",
  Spain: "ES",
  Portugal: "PT",
};

type Method = "card" | "bank";

interface Info {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

function CheckBig() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const stripePromise = getStripePromise();

export function Checkout({ bank, commerce }: { bank: BankDetails; commerce: CommerceSetting }) {
  const { checkout, setCheckout, items, subtotal, clear, discount, discountAmount, freeShipCode } = useShop();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<Info>({ name: "", email: "", address: "", city: "", zip: "", country: "Greece" });
  const stripeAvailable = !!stripePromise;
  // "card" is offered in both real (Stripe) and offline-demo modes.
  const [method, setMethod] = useState<Method>("card");
  const [order, setOrder] = useState<ClientOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const piRef = useRef<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState("");

  // Mirror the server's priceCart math (lib/orders.ts) so the displayed totals
  // match what's actually charged. Money here is in euros; the server is the
  // source of truth in cents.
  const freeShipOver = commerce.freeShipThresholdCents / 100;
  const flatShip = commerce.shippingFlatCents / 100;
  const shipping = subtotal >= freeShipOver || freeShipCode || subtotal === 0 ? 0 : flatShip;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxRate = commerce.taxRatePct > 0 ? commerce.taxRatePct / 100 : 0;
  const tax =
    taxRate <= 0
      ? 0
      : commerce.taxIncluded
        ? taxableBase - taxableBase / (1 + taxRate)
        : taxableBase * taxRate;
  const total = taxableBase + shipping + (commerce.taxIncluded ? 0 : tax);
  const cart = items.map((it) => ({ id: it.id, variant: it.variant || undefined, qty: it.qty }));

  useEffect(() => {
    if (checkout) {
      setStep(0);
      setOrder(null);
      setMethod("card");
      setClientSecret(null);
      piRef.current = null;
      setPayError("");
    }
  }, [checkout, stripeAvailable]);

  // Create / refresh the PaymentIntent once on the Payment step (and whenever
  // the total changes) so the Payment Element + wallet share one secret.
  useEffect(() => {
    if (!checkout || step < 1 || !stripeAvailable || items.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart, discountCode: discount?.code ?? null, email: info.email, paymentIntentId: piRef.current }),
        });
        const data = await res.json();
        if (!cancelled && data.ok) {
          piRef.current = data.paymentIntentId;
          setClientSecret(data.clientSecret);
        }
      } catch {
        /* ignore — bank transfer still works */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, step, total, stripeAvailable]);

  if (!checkout) return null;

  const set = (k: keyof Info, v: string) => setInfo((s) => ({ ...s, [k]: v }));
  const f = "w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-[13.5px] text-ink placeholder:text-mute focus:border-gold focus:outline-none";
  const step0Ok = !!(info.name && info.email.includes("@") && info.address && info.city);

  const copyIban = () => {
    try {
      navigator.clipboard.writeText(bank.iban.replace(/\s/g, ""));
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const onPaid = (o: ClientOrder) => {
    setOrder(o);
    clear();
  };

  const placeBank = async () => {
    if (placing) return;
    setPlacing(true);
    setPayError("");
    try {
      const res = await fetch("/api/checkout/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, discountCode: discount?.code ?? null, contact: info }),
      });
      const data = await res.json();
      if (data.ok) onPaid(data.order);
      else setPayError(data.error || "Could not place order");
    } catch {
      setPayError("Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  const Step = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-2">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${step >= n ? "bg-gold text-white" : "bg-ink/10 text-mute"}`}>{n + 1}</span>
      <span className={`text-[11px] font-medium uppercase tracking-[0.14em] ${step >= n ? "text-ink" : "text-mute"}`}>{label}</span>
    </div>
  );

  const flow: FlowProps = {
    step, setStep, method, setMethod, info, items, subtotal, discount, discountAmount, shipping, tax, total,
    commerce, bank, copied, copyIban, placing, payError, cart, onPaid, placeBank, stripeAvailable,
    stripeReady: stripeAvailable && !!clientSecret, f,
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setCheckout(false)}></div>
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h3 className="font-serif text-[22px] font-medium text-ink">{order ? <span className="whitespace-nowrap">Order confirmed</span> : "Checkout"}</h3>
          <button onClick={() => setCheckout(false)} className="rounded-lg p-2 text-mute hover:bg-ink/5 hover:text-ink"><CloseIcon size={18} /></button>
        </div>

        {order ? (
          order.payment === "Awaiting payment" ? (
            <div className="px-7 py-9 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold"><BankIcon size={28} /></div>
              <div className="font-serif text-[26px] font-medium text-ink">Almost there{info.name ? ", " + info.name.split(" ")[0] : ""}!</div>
              <p className="mx-auto mt-3 max-w-sm text-[13.5px] font-light leading-relaxed text-mute">Order <span className="font-medium text-ink">#{order.number}</span> is reserved. Transfer <span className="font-medium text-ink">{eur(order.totalEur)}</span> to the account below using <span className="font-medium text-ink">#{order.number}</span> as the reference — we ship the moment it clears.</p>
              <div className="mx-auto mt-5 max-w-xs space-y-1.5 rounded-xl border border-ink/12 bg-sand/30 p-4 text-left text-[12.5px] text-ink">
                <div className="flex justify-between gap-3"><span className="text-mute">IBAN</span><span className="font-mono">{bank.iban}</span></div>
                <div className="flex justify-between gap-3"><span className="text-mute">BIC</span><span className="font-mono">{bank.bic}</span></div>
                <div className="flex justify-between gap-3"><span className="text-mute">Reference</span><span className="font-medium">#{order.number}</span></div>
              </div>
              <button onClick={() => setCheckout(false)} className="mt-7 rounded-full bg-ink px-7 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90">Done</button>
            </div>
          ) : (
            <div className="px-7 py-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold"><CheckBig /></div>
              <div className="font-serif text-[26px] font-medium text-ink">Thank you{info.name ? ", " + info.name.split(" ")[0] : ""}!</div>
              <p className="mx-auto mt-3 max-w-xs text-[13.5px] font-light leading-relaxed text-mute">Your order <span className="font-medium text-ink">#{order.number}</span> is confirmed. We&apos;ve emailed a receipt to <span className="text-ink">{info.email}</span> and will let you know when it ships.</p>
              <button onClick={() => setCheckout(false)} className="mt-7 rounded-full bg-ink px-7 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90">Continue shopping</button>
            </div>
          )
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-ink/8 px-6 py-4">
              <Step n={0} label="Details" /><span className="h-px flex-1 bg-ink/10" /><Step n={1} label="Payment" /><span className="h-px flex-1 bg-ink/10" /><Step n={2} label="Review" />
            </div>

            {step === 0 ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
                  <input className={f} placeholder="Full name" value={info.name} onChange={(e) => set("name", e.target.value)} />
                  <input className={f} placeholder="Email" value={info.email} onChange={(e) => set("email", e.target.value)} />
                  <input className={f} placeholder="Address" value={info.address} onChange={(e) => set("address", e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className={f} placeholder="City" value={info.city} onChange={(e) => set("city", e.target.value)} />
                    <input className={f} placeholder="Postcode" value={info.zip} onChange={(e) => set("zip", e.target.value)} />
                  </div>
                  <select className={f} value={info.country} onChange={(e) => set("country", e.target.value)}>
                    {Object.keys(COUNTRY_CODE).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2.5 border-t border-ink/10 px-6 py-4">
                  <button onClick={() => setStep(1)} disabled={!step0Ok} className={`ml-auto rounded-lg px-5 py-2.5 text-[12.5px] font-medium text-paper transition-colors ${step0Ok ? "bg-ink hover:bg-ink/90" : "cursor-not-allowed bg-ink/30"}`}>Continue</button>
                </div>
              </>
            ) : (
              // Always wrap in <Elements> so PayArea's useStripe/useElements are
              // safe. stripe=null in offline-demo mode; keyed by clientSecret so
              // the Payment Element mounts with its secret once the intent exists.
              <Elements
                key={clientSecret || "no-cs"}
                stripe={stripeAvailable ? stripePromise : null}
                options={clientSecret ? { clientSecret, appearance: elementsAppearance } : undefined}
              >
                <PayArea {...flow} />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface FlowProps {
  step: number;
  setStep: (n: number) => void;
  method: Method;
  setMethod: (m: Method) => void;
  info: Info;
  items: ReturnType<typeof useShop>["items"];
  subtotal: number;
  discount: ReturnType<typeof useShop>["discount"];
  discountAmount: number;
  shipping: number;
  tax: number;
  total: number;
  commerce: CommerceSetting;
  bank: BankDetails;
  copied: boolean;
  copyIban: () => void;
  placing: boolean;
  payError: string;
  cart: { id: string; variant?: string; qty: number }[];
  onPaid: (o: ClientOrder) => void;
  placeBank: () => void;
  stripeAvailable: boolean;
  stripeReady: boolean;
  f: string;
}

// Renders Payment (step 1) + Review (step 2) bodies and their footer. Lives
// inside <Elements> when Stripe is configured so the Pay button can confirm.
function PayArea(p: FlowProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [localErr, setLocalErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  // Wallet (Apple/Google Pay) express button — only appears when the browser
  // actually has a wallet available.
  useEffect(() => {
    if (!stripe || p.method === "bank") return;
    const pr = stripe.paymentRequest({
      country: "GR",
      currency: "eur",
      total: { label: "PATHOS by Yeralis", amount: Math.round(p.total * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((res) => {
      if (res) setPaymentRequest(pr);
    });
    pr.on("paymentmethod", async (ev) => {
      try {
        const intentRes = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: p.cart, discountCode: p.discount?.code ?? null, email: p.info.email }),
        });
        const intent = await intentRes.json();
        if (!intent.ok) {
          ev.complete("fail");
          return;
        }
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          intent.clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: true },
        );
        if (error) {
          ev.complete("fail");
          return;
        }
        ev.complete("success");
        if (paymentIntent && paymentIntent.status === "succeeded") {
          const wallet = ev.walletName === "applePay" ? "apple" : ev.walletName === "googlePay" ? "google" : "card";
          await finalize(paymentIntent.id, wallet);
        }
      } catch {
        ev.complete("fail");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, p.method, p.total]);

  const finalize = async (paymentIntentId: string, methodHint: "card" | "apple" | "google") => {
    const res = await fetch("/api/checkout/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId, cart: p.cart, discountCode: p.discount?.code ?? null, contact: p.info, method: methodHint }),
    });
    const data = await res.json();
    if (data.ok) p.onPaid(data.order);
    else setLocalErr(data.error || "Could not finalize order");
  };

  const payCard = async () => {
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setLocalErr("");
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setLocalErr(submitError.message || "Please check your card details");
      setBusy(false);
      return;
    }
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: typeof window !== "undefined" ? window.location.href : "" },
    });
    if (error) {
      setLocalErr(error.message || "Payment failed");
      setBusy(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === "succeeded") {
      await finalize(paymentIntent.id, "card");
    }
    setBusy(false);
  };

  // Offline demo: no Stripe → create a paid test order via /api/checkout/demo.
  const demoMode = !p.stripeAvailable;
  const payDemo = async () => {
    if (busy) return;
    setBusy(true);
    setLocalErr("");
    try {
      const res = await fetch("/api/checkout/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: p.cart, discountCode: p.discount?.code ?? null, contact: p.info }),
      });
      const data = await res.json();
      if (data.ok) p.onPaid(data.order);
      else setLocalErr(data.error || "Could not create demo order");
    } catch {
      setLocalErr("Could not create demo order");
    } finally {
      setBusy(false);
    }
  };

  const MethodRow = ({ id, icon, title, sub }: { id: Method; icon: React.ReactNode; title: string; sub?: string }) => (
    <button onClick={() => p.setMethod(id)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${p.method === id ? "border-gold bg-gold/[0.06]" : "border-ink/15 hover:border-ink/30"}`}>
      <span className={p.method === id ? "text-gold" : "text-mute"}>{icon}</span>
      <span className="flex-1"><span className="block text-[13px] font-medium text-ink">{title}</span>{sub && <span className="block text-[11.5px] font-light text-mute">{sub}</span>}</span>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${p.method === id ? "border-gold" : "border-ink/25"}`}>{p.method === id && <span className="h-2 w-2 rounded-full bg-gold" />}</span>
    </button>
  );

  const payLabel = p.method === "bank" ? "Confirm order" : "Pay " + eur(p.total);
  const onPay = p.method === "bank" ? p.placeBank : demoMode ? payDemo : payCard;
  const busyAll = busy || p.placing;

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
        {/* ── Payment step (kept mounted so the card field survives step 2) ── */}
        <div className={p.step === 1 ? "space-y-3" : "hidden"}>
          <div className="rounded-lg bg-sand/40 p-3 text-[11.5px] font-light text-mute">
            {demoMode
              ? "Offline demo — a paid test order is created instantly (no charge, no network). Add Stripe test keys to enable real card & wallet payments."
              : "Test mode — use Stripe test card 4242 4242 4242 4242, any future date & CVC."}
          </div>
          {/* express pay */}
          {/* Apple/Google Pay express button — only shown when the browser
              actually has a wallet available (no misleading dead pills). */}
          {p.stripeAvailable && paymentRequest && (
            <>
              <PaymentRequestButtonElement options={{ paymentRequest }} />
              <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-[0.16em] text-mute"><span className="h-px flex-1 bg-ink/10" />or pay another way<span className="h-px flex-1 bg-ink/10" /></div>
            </>
          )}
          {/* method picker */}
          <div className="space-y-2.5">
            <MethodRow
              id="card"
              icon={<CardIcon size={20} />}
              title={demoMode ? "Card (demo)" : "Credit / debit card"}
              sub={demoMode ? "Simulated — no real charge" : "Visa · Mastercard · Maestro"}
            />
            <MethodRow id="bank" icon={<BankIcon size={20} />} title="Bank transfer / deposit" sub="Pay by IBAN — ships once it clears" />
          </div>
          {p.method === "card" && !demoMode && (
            p.stripeReady ? (
              <div className="space-y-3 pt-1">
                <PaymentElement options={{ layout: "tabs" }} />
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-light text-mute"><LockIcon size={13} className="text-gold" /> Encrypted &amp; secure · we never store card numbers</div>
              </div>
            ) : (
              <div className="rounded-lg border border-ink/12 bg-sand/30 px-4 py-6 text-center text-[12.5px] font-light text-mute">Loading secure payment…</div>
            )
          )}
          {p.method === "card" && demoMode && (
            <div className="rounded-lg border border-ink/12 bg-sand/30 px-4 py-3 text-[12.5px] font-light leading-relaxed text-mute">
              Demo checkout — clicking <span className="font-medium text-ink">Pay</span> creates a paid test order so you can see the confirmation and find it in the admin. No card is charged.
            </div>
          )}
          {p.method === "bank" && (
            <div className="space-y-2 rounded-xl border border-ink/12 bg-sand/30 p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">Transfer the total to</div>
              <div className="space-y-1.5 text-[13px] text-ink">
                <div className="flex justify-between gap-3"><span className="text-mute">Beneficiary</span><span className="text-right">{p.bank.beneficiary}</span></div>
                <div className="flex justify-between gap-3"><span className="text-mute">Bank</span><span>{p.bank.bank}</span></div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-mute">IBAN</span>
                  <button onClick={p.copyIban} className="flex items-center gap-1.5 font-mono text-[12.5px] text-ink hover:text-gold">{p.bank.iban} <CopyIcon size={13} />{p.copied && <span className="text-[10px] not-italic text-gold">copied</span>}</button>
                </div>
                <div className="flex justify-between gap-3"><span className="text-mute">BIC</span><span className="font-mono">{p.bank.bic}</span></div>
              </div>
              <p className="pt-1 text-[11.5px] font-light leading-relaxed text-mute">{p.bank.note}</p>
            </div>
          )}
        </div>

        {/* ── Review step ── */}
        {p.step === 2 && (
          <>
            <div className="divide-y divide-ink/8">
              {p.items.map((it) => (
                <div key={it.key} className="flex items-center gap-3 py-2.5">
                  <ArtBox art={it.art} box="h-12 w-12" scale="scale-[0.36]" />
                  <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium text-ink">{it.name}</div><div className="text-[11.5px] text-mute">{it.variant ? it.variant + " · " : ""}Qty {it.qty}</div></div>
                  <span className="text-[12.5px] text-ink">{eur(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3"><DiscountField /></div>
            <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-[13px]">
              <div className="flex justify-between text-mute"><span>Subtotal</span><span>{eur(p.subtotal)}</span></div>
              {p.discount && p.discountAmount > 0 && <div className="flex justify-between text-gold"><span className="whitespace-nowrap">Discount ({p.discount.code})</span><span>−{eur(p.discountAmount)}</span></div>}
              <div className="flex justify-between text-mute"><span>Shipping</span><span>{p.shipping === 0 ? "Free" : eur(p.shipping)}</span></div>
              {p.commerce.taxRatePct > 0 && (
                <div className="flex justify-between text-mute"><span className="whitespace-nowrap">Tax (VAT {p.commerce.taxRatePct}%{p.commerce.taxIncluded ? ", incl." : ""})</span><span>{eur(p.tax)}</span></div>
              )}
              <div className="flex justify-between pt-1 font-semibold text-ink"><span>Total</span><span>{eur(p.total)}</span></div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-sand/40 px-3 py-2.5 text-[12.5px]">
              <span className="whitespace-nowrap text-mute">Paying with</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap font-medium text-ink">{p.method === "card" ? <CardIcon size={15} className="text-mute" /> : <BankIcon size={15} className="text-mute" />}{p.method === "card" ? "Card" : "Bank transfer"}</span>
            </div>
            <div className="mt-2 text-[12px] font-light text-mute">Shipping to {p.info.name}, {p.info.address}, {p.info.city} {p.info.zip}, {p.info.country}.</div>
          </>
        )}

        {(localErr || p.payError) && <div className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{localErr || p.payError}</div>}
      </div>

      <div className="flex items-center gap-2.5 border-t border-ink/10 px-6 py-4">
        <button onClick={() => p.setStep(p.step - 1)} className="rounded-lg border border-ink/15 px-4 py-2.5 text-[12.5px] font-medium text-ink/80 hover:bg-ink/[0.04]">Back</button>
        {p.step === 1 && <button onClick={() => p.setStep(2)} className="ml-auto rounded-lg bg-ink px-5 py-2.5 text-[12.5px] font-medium text-paper transition-colors hover:bg-ink/90">Continue</button>}
        {p.step === 2 && (
          <button onClick={onPay} disabled={busyAll} className={`ml-auto rounded-lg bg-gold px-6 py-2.5 text-[12.5px] font-medium uppercase tracking-[0.14em] text-white hover:bg-gold/90 ${busyAll ? "opacity-60" : ""}`}>
            {busyAll ? "Processing…" : payLabel}
          </button>
        )}
      </div>
    </>
  );
}
