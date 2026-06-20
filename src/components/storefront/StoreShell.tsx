"use client";

// Shared storefront chrome: providers + header/nav + footer + all overlays
// (cart, wishlist, PDP, checkout, chat, welcome popup). Pages slot their body
// in as children, so the full shopping experience works on every page.
import { ShopProvider } from "./shop-context";
import { AnnouncementBar } from "./AnnouncementBar";
import { TopBar } from "./TopBar";
import { Nav } from "./Nav";
import { SiteFooter } from "./SiteFooter";
import { ChatWidget } from "./ChatWidget";
import { EntryPopup } from "./EntryPopup";
import { OverlayManager } from "./OverlayManager";
import { PDPModal } from "./PDPModal";
import { WishDrawer } from "./WishDrawer";
import { CartDrawer } from "./CartDrawer";
import { Checkout } from "./Checkout";
import type { ReactNode } from "react";
import type { StoreProduct, StoreSettings } from "@/lib/types";
import type { BankDetails } from "@/lib/bank";

export function StoreShell({
  products,
  settings,
  bank,
  children,
}: {
  products: StoreProduct[];
  settings: StoreSettings;
  bank: BankDetails;
  children: ReactNode;
}) {
  return (
    <ShopProvider products={products}>
      <div className="min-h-screen font-sans text-ink">
        <AnnouncementBar announcement={settings.announcement} season={settings.season} />
        <header>
          <TopBar />
          <Nav menu={settings.menu} collections={settings.collections} />
        </header>
        {children}
        <SiteFooter contact={settings.contact} footer={settings.footer} />
        <ChatWidget contact={settings.contact} />
        <EntryPopup popup={settings.popup} />
        <PDPModal />
        <WishDrawer />
        <CartDrawer />
        <Checkout bank={bank} />
        <OverlayManager />
      </div>
    </ShopProvider>
  );
}
