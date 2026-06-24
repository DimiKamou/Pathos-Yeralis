"use client";

// Cart + wishlist + overlay state. Ported from the original app's ShopProvider
// (src/components/storefront/shop-context.tsx) with one change: discounts are
// checked locally (catalog.ts) instead of via /api/discount, so v2 needs no
// backend. Cart & wishlist persist to localStorage, exactly as the original.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, DiscountResult, FeelingKey, StoreProduct } from "@/lib/types";
import { PRODUCTS, checkDiscount } from "@/lib/catalog";

interface ShopValue {
  products: StoreProduct[];
  active: StoreProduct[];
  byFeeling: (k: FeelingKey) => StoreProduct[];
  productById: (id: string) => StoreProduct | undefined;
  items: CartLine[];
  add: (p: StoreProduct, variant?: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  pdp: StoreProduct | null;
  setPdp: (p: StoreProduct | null) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  checkout: boolean;
  setCheckout: (v: boolean) => void;
  wish: string[];
  wishOpen: boolean;
  setWishOpen: (v: boolean) => void;
  toggleWish: (id: string) => void;
  inWish: (id: string) => boolean;
  wishCount: number;
  discount: DiscountResult | null;
  applyDiscount: (code: string) => DiscountResult | null;
  clearDiscount: () => void;
  discountAmount: number;
  freeShipCode: boolean;
  query: string;
  setQuery: (q: string) => void;
  results: StoreProduct[];
}

const Ctx = createContext<ShopValue | null>(null);
export const useShop = (): ShopValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used within ShopProvider");
  return v;
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const products = PRODUCTS;
  const [items, setItems] = useState<CartLine[]>([]);
  const [wish, setWish] = useState<string[]>([]);
  const [pdp, setPdp] = useState<StoreProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [discount, setDiscount] = useState<DiscountResult | null>(null);
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted cart/wishlist after mount (avoids SSR mismatch).
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("pathos2.cart") || "[]")); } catch { /* ignore */ }
    try { setWish(JSON.parse(localStorage.getItem("pathos2.wish") || "[]")); } catch { /* ignore */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) try { localStorage.setItem("pathos2.cart", JSON.stringify(items)); } catch { /* ignore */ } }, [items, hydrated]);
  useEffect(() => { if (hydrated) try { localStorage.setItem("pathos2.wish", JSON.stringify(wish)); } catch { /* ignore */ } }, [wish, hydrated]);

  const active = useMemo(() => products.filter((p) => p.status === "Active"), [products]);
  const productById = (id: string) => products.find((p) => p.id === id);
  const byFeeling = (k: FeelingKey) => active.filter((p) => p.feeling === k);

  const add = (p: StoreProduct, variant = "", qty = 1) =>
    setItems((prev) => {
      const key = p.id + "|" + (variant || "");
      const i = prev.findIndex((x) => x.key === key);
      if (i >= 0) {
        const n = prev.slice();
        n[i] = { ...n[i], qty: n[i].qty + qty };
        return n;
      }
      return [...prev, { key, id: p.id, name: p.name, art: p.art, price: p.price, variant: variant || "", qty }];
    });
  const setQty = (key: string, qty: number) =>
    setItems((prev) => (qty <= 0 ? prev.filter((x) => x.key !== key) : prev.map((x) => (x.key === key ? { ...x, qty } : x))));
  const remove = (key: string) => setItems((prev) => prev.filter((x) => x.key !== key));
  const clear = () => { setItems([]); setDiscount(null); };
  const count = items.reduce((s, x) => s + x.qty, 0);
  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);

  const toggleWish = (id: string) => setWish((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const inWish = (id: string) => wish.includes(id);

  const applyDiscount = (code: string): DiscountResult | null => {
    const d = checkDiscount(code);
    setDiscount(d);
    return d;
  };
  const clearDiscount = () => setDiscount(null);
  const discountAmount = discount ? +(subtotal * discount.pct).toFixed(2) : 0;
  const freeShipCode = !!(discount && discount.freeShip);

  // Live search across name / collection / material / feeling gloss.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return active.filter((p) =>
      [p.name, p.collection, p.material ?? "", p.feeling].join(" ").toLowerCase().includes(q),
    );
  }, [query, active]);

  return (
    <Ctx.Provider
      value={{
        products, active, byFeeling, productById,
        items, add, setQty, remove, clear, count, subtotal,
        pdp, setPdp, cartOpen, setCartOpen, checkout, setCheckout,
        wish, wishOpen, setWishOpen, toggleWish, inWish, wishCount: wish.length,
        discount, applyDiscount, clearDiscount, discountAmount, freeShipCode,
        query, setQuery, results,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
