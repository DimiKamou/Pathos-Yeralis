"use client";

// Cart drawer — logic ported from the original (qty steppers, remove, discount,
// free-shipping threshold), reskinned to the marble/garnet system.
import { eur } from "@/lib/money";
import { CloseIcon, BagIcon } from "./icons";
import { ArtBox } from "./product-art";
import { useShop } from "./shop-context";
import { DiscountField } from "./DiscountField";

export function CartDrawer() {
  const { items, cartOpen, setCartOpen, setQty, remove, subtotal, setCheckout, count, discount, discountAmount, freeShipCode } = useShop();
  if (!cartOpen) return null;
  const total = Math.max(0, subtotal - discountAmount);
  const freeShip = subtotal >= 100 || freeShipCode;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-night/45 backdrop-blur-[1px]" onClick={() => setCartOpen(false)} />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-marble shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate/10 px-6 py-5">
          <h3 className="font-display text-[22px] font-500 text-slate">Your bag {count > 0 && <span className="text-ash">· {count}</span>}</h3>
          <button onClick={() => setCartOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-ash hover:bg-stone/50 hover:text-slate"><CloseIcon size={18} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-ash">
            <BagIcon size={38} />
            <div className="mt-4 font-display text-[20px] text-slate">Nothing here yet</div>
            <p className="mt-2 font-ui text-[13px] font-300">Find a piece that matches the feeling.</p>
            <button onClick={() => setCartOpen(false)} className="mt-5 rounded-full bg-slate px-6 py-2.5 font-ui text-[11px] font-600 uppercase tracking-[0.16em] text-marble hover:bg-slate/90">Browse the work</button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-slate/10 overflow-y-auto px-6">
              {items.map((it) => (
                <div key={it.key} className="flex gap-4 py-4">
                  <ArtBox art={it.art} box="h-16 w-16" scale="scale-[0.48]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <span className="font-display text-[15px] font-500 text-slate">{it.name}</span>
                      <span className="font-ui text-[13px] text-slate">{eur(it.price * it.qty)}</span>
                    </div>
                    {it.variant && <div className="mt-0.5 font-ui text-[11.5px] text-ash">{it.variant}</div>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-slate/20">
                        <button onClick={() => setQty(it.key, it.qty - 1)} aria-label="Decrease" className="px-2.5 py-1 text-slate/70 hover:text-slate">−</button>
                        <span className="w-7 text-center font-ui text-[12px] text-slate">{it.qty}</span>
                        <button onClick={() => setQty(it.key, it.qty + 1)} aria-label="Increase" className="px-2.5 py-1 text-slate/70 hover:text-slate">+</button>
                      </div>
                      <button onClick={() => remove(it.key)} className="font-ui text-[11.5px] text-ash hover:text-garnet">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate/10 px-6 py-5">
              <div className="mb-4"><DiscountField /></div>
              <div className="flex justify-between font-ui text-[13px] text-ash"><span>Subtotal</span><span className="text-slate">{eur(subtotal)}</span></div>
              {discount && discountAmount > 0 && <div className="mt-1 flex justify-between font-ui text-[13px] text-garnet"><span>Discount ({discount.code})</span><span>−{eur(discountAmount)}</span></div>}
              <div className="mt-1 flex justify-between font-ui text-[12px] text-ash"><span>Shipping</span><span>{freeShip ? "Free" : "Calculated at checkout"}</span></div>
              <button onClick={() => { setCartOpen(false); setCheckout(true); }} className="mt-4 w-full rounded-full bg-garnet py-3.5 font-ui text-[11.5px] font-600 uppercase tracking-[0.18em] text-chalk transition-colors hover:bg-garnet/85">
                Checkout · {eur(total)}
              </button>
              <button onClick={() => setCartOpen(false)} className="mt-2 w-full font-ui text-[11.5px] tracking-wide text-ash hover:text-slate">Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
