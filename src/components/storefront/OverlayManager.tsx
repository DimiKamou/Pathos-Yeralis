"use client";

// Global overlay behavior for all drawers/modals: lock body scroll while any is
// open, and close the topmost one on Escape. Keeps the individual overlays simple.
import { useEffect } from "react";
import { useShop } from "./shop-context";

export function OverlayManager() {
  const { cartOpen, setCartOpen, wishOpen, setWishOpen, checkout, setCheckout, pdp, setPdp } = useShop();
  const anyOpen = cartOpen || wishOpen || checkout || !!pdp;

  useEffect(() => {
    if (!anyOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (checkout) setCheckout(false);
      else if (pdp) setPdp(null);
      else if (cartOpen) setCartOpen(false);
      else if (wishOpen) setWishOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [anyOpen, cartOpen, wishOpen, checkout, pdp, setCartOpen, setWishOpen, setCheckout, setPdp]);

  return null;
}
