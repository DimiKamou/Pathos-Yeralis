"use client";

// Cart drawer. Ported from the prototype; uses the shared DiscountField, and
// line thumbnails look up the product's imageUrl via productById (cart lines
// carry `art` but not `imageUrl`).
import { eur } from "@/lib/money";
import { CloseIcon, BagIcon } from "@/components/storefront/icons";
import { ArtBox } from "@/components/storefront/product-art";
import { useShop } from "@/components/storefront/shop-context";
import { DiscountField } from "@/components/storefront/DiscountField";

export function CartDrawer() {
  const { items, cartOpen, setCartOpen, setQty, remove, subtotal, setCheckout, count, discount, discountAmount, freeShipCode, productById } = useShop();
  if (!cartOpen) return null;
  const total = Math.max(0, subtotal - discountAmount);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" onClick={() => setCartOpen(false)}></div>
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h3 className="font-serif text-[22px] font-medium text-ink">Your bag {count > 0 && <span className="text-mute">({count})</span>}</h3>
          <button onClick={() => setCartOpen(false)} className="rounded-lg p-2 text-mute hover:bg-ink/5 hover:text-ink"><CloseIcon size={18} /></button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 text-mute"><BagIcon size={40} /></div>
            <div className="font-serif text-[20px] text-ink">Your bag is empty</div>
            <p className="mt-2 text-[13px] font-light text-mute">Discover handmade pieces from the Aegean.</p>
            <button onClick={() => setCartOpen(false)} className="mt-5 rounded-full bg-ink px-6 py-2.5 text-[12px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90">Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-ink/8 overflow-y-auto px-6">
              {items.map((it) => (
                <div key={it.key} className="flex gap-4 py-4">
                  <ArtBox art={it.art} imageUrl={productById(it.id)?.imageUrl} box="h-16 w-16" scale="scale-[0.48]" alt={it.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <span className="text-[13.5px] font-medium text-ink">{it.name}</span>
                      <span className="text-[13px] text-ink">{eur(it.price * it.qty)}</span>
                    </div>
                    {it.variant && <div className="mt-0.5 text-[11.5px] text-mute">{it.variant}</div>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-ink/20">
                        <button onClick={() => setQty(it.key, it.qty - 1)} className="px-2.5 py-1 text-ink/70 hover:text-ink">−</button>
                        <span className="w-7 text-center text-[12px] text-ink">{it.qty}</span>
                        <button onClick={() => setQty(it.key, it.qty + 1)} className="px-2.5 py-1 text-ink/70 hover:text-ink">+</button>
                      </div>
                      <button onClick={() => remove(it.key)} className="text-[11.5px] text-mute hover:text-rose-500">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-ink/10 px-6 py-5">
              <div className="mb-4"><DiscountField /></div>
              <div className="flex justify-between text-[13px] text-mute"><span>Subtotal</span><span className="text-ink">{eur(subtotal)}</span></div>
              {discount && discountAmount > 0 && <div className="mt-1 flex justify-between text-[13px] text-gold"><span>Discount ({discount.code})</span><span>−{eur(discountAmount)}</span></div>}
              <div className="mt-1 flex justify-between text-[12px] text-mute"><span>Shipping</span><span>{(subtotal >= 100 || freeShipCode) ? "Free" : "Calculated at checkout"}</span></div>
              <button onClick={() => { setCartOpen(false); setCheckout(true); }} className="mt-4 w-full rounded-full bg-gold py-3.5 text-[12.5px] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-gold/90">Checkout · {eur(total)}</button>
              <button onClick={() => setCartOpen(false)} className="mt-2 w-full text-[11.5px] tracking-wide text-mute hover:text-ink">Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
