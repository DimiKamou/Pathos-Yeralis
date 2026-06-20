"use client";

// Cart + wishlist + overlay state, ported from the prototype's ShopProvider.
// Cart & wishlist persist to localStorage (alpha); discounts are validated
// SERVER-SIDE via /api/discount and re-checked at checkout. Catalog comes
// from the DB via props.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, DiscountResult, StoreProduct } from "@/lib/types";

interface ShopContextValue {
  products: StoreProduct[];
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
  applyDiscount: (code: string) => Promise<DiscountResult | null>;
  clearDiscount: () => void;
  discountAmount: number;
  freeShipCode: boolean;
  query: string;
  setQuery: (q: string) => void;
}

const ShopCtx = createContext<ShopContextValue | null>(null);
export const useShop = (): ShopContextValue => {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
};

export function variantsFor(art: string): { label: string; opts: string[] } | null {
  if (art === "necklace") return { label: "Length", opts: ["40 cm", "45 cm", "50 cm"] };
  if (art === "ring") return { label: "Ring size", opts: ["50", "52", "54", "56"] };
  if (art === "bracelet") return { label: "Size", opts: ["S", "M", "L"] };
  return null;
}

export function ShopProvider({
  products,
  children,
}: {
  products: StoreProduct[];
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [wish, setWish] = useState<string[]>([]);
  const [pdp, setPdp] = useState<StoreProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [discount, setDiscount] = useState<DiscountResult | null>(null);
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("pathos.cart") || "[]"));
    } catch {
      /* ignore */
    }
    try {
      setWish(JSON.parse(localStorage.getItem("pathos.wishlist") || "[]"));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) try { localStorage.setItem("pathos.cart", JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, hydrated]);
  useEffect(() => {
    if (hydrated) try { localStorage.setItem("pathos.wishlist", JSON.stringify(wish)); } catch { /* ignore */ }
  }, [wish, hydrated]);

  const productById = (id: string) => products.find((p) => p.id === id);

  // Reconcile the persisted cart/wishlist against the live catalog: drop items
  // whose product was removed, set to Draft, or sold out; refresh name/price;
  // clamp qty to stock. Prune deleted wishlist ids (keeps wishCount honest).
  useEffect(() => {
    if (!hydrated) return;
    setItems((prev) => {
      const next: CartLine[] = [];
      for (const it of prev) {
        const p = products.find((x) => x.id === it.id);
        if (!p || p.status !== "Active" || p.stock <= 0) continue;
        next.push({ ...it, name: p.name, art: p.art, price: p.price, qty: Math.min(it.qty, p.stock) });
      }
      return next;
    });
    setWish((prev) => prev.filter((id) => products.some((p) => p.id === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, products]);

  const add = (p: StoreProduct, variant = "", qty = 1) =>
    setItems((prev) => {
      const key = p.id + "|" + (variant || "");
      const max = Math.max(1, p.stock);
      const i = prev.findIndex((x) => x.key === key);
      if (i >= 0) {
        const n = prev.slice();
        n[i] = { ...n[i], qty: Math.min(n[i].qty + qty, max) };
        return n;
      }
      return [...prev, { key, id: p.id, name: p.name, art: p.art, price: p.price, variant: variant || "", qty: Math.min(qty, max) }];
    });
  const setQty = (key: string, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((x) => x.key !== key)
        : prev.map((x) => {
            if (x.key !== key) return x;
            const max = Math.max(1, productById(x.id)?.stock ?? qty);
            return { ...x, qty: Math.min(qty, max) };
          }),
    );
  const remove = (key: string) => setItems((prev) => prev.filter((x) => x.key !== key));
  const clear = () => {
    setItems([]);
    setDiscount(null);
  };
  const count = items.reduce((s, x) => s + x.qty, 0);
  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);

  const toggleWish = (id: string) => setWish((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const inWish = (id: string) => wish.includes(id);
  const wishCount = wish.length;

  const applyDiscount = async (code: string): Promise<DiscountResult | null> => {
    try {
      const res = await fetch("/api/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setDiscount(null);
        return null;
      }
      const data = (await res.json()) as { discount: DiscountResult | null };
      setDiscount(data.discount);
      return data.discount;
    } catch {
      setDiscount(null);
      return null;
    }
  };
  const clearDiscount = () => setDiscount(null);
  const discountAmount = discount ? +(subtotal * discount.pct).toFixed(2) : 0;
  const freeShipCode = !!(discount && discount.freeShip);

  return (
    <ShopCtx.Provider
      value={{
        products,
        productById,
        items,
        add,
        setQty,
        remove,
        clear,
        count,
        subtotal,
        pdp,
        setPdp,
        cartOpen,
        setCartOpen,
        checkout,
        setCheckout,
        wish,
        wishOpen,
        setWishOpen,
        toggleWish,
        inWish,
        wishCount,
        discount,
        applyDiscount,
        clearDiscount,
        discountAmount,
        freeShipCode,
        query,
        setQuery,
      }}
    >
      {children}
    </ShopCtx.Provider>
  );
}
