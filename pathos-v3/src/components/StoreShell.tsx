"use client";

// Shared chrome: provider + announcement + header + footer + every overlay.
// Page bodies slot in as children, so the full shopping experience (cart,
// wishlist, PDP, checkout, welcome popup) works around any content.
import type { ReactNode } from "react";
import { ShopProvider } from "./shop-context";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { EntryPopup } from "./EntryPopup";
import { PDPModal } from "./PDPModal";
import { WishDrawer } from "./WishDrawer";
import { CartDrawer } from "./CartDrawer";
import { Checkout } from "./Checkout";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <ShopProvider>
      <div id="top" className="relative">
        <AnnouncementBar />
        <Header />
        {children}
        <Footer />
        <EntryPopup />
        <PDPModal />
        <WishDrawer />
        <CartDrawer />
        <Checkout />
      </div>
    </ShopProvider>
  );
}
