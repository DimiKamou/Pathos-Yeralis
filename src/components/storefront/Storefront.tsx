"use client";

// Client root — composes the storefront exactly like the prototype's <App/>.
import { ShopProvider } from "./shop-context";
import { AnnouncementBar } from "./AnnouncementBar";
import { TopBar } from "./TopBar";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { ShopByCollection, Carousel, Promo } from "./Sections";
import { VisitUs } from "./VisitUs";
import { SiteFooter } from "./SiteFooter";
import { ChatWidget } from "./ChatWidget";
import { EntryPopup } from "./EntryPopup";
import { PDPModal } from "./PDPModal";
import { WishDrawer } from "./WishDrawer";
import { CartDrawer } from "./CartDrawer";
import { Checkout } from "./Checkout";
import type { StoreProduct, StoreSettings } from "@/lib/types";
import type { BankDetails } from "@/lib/bank";

export function Storefront({
  products,
  settings,
  bank,
  heroImage,
}: {
  products: StoreProduct[];
  settings: StoreSettings;
  bank: BankDetails;
  heroImage?: string | null;
}) {
  return (
    <ShopProvider products={products}>
      <div className="min-h-screen font-sans text-ink">
        <AnnouncementBar announcement={settings.announcement} season={settings.season} />
        <header>
          <TopBar />
          <Nav menu={settings.menu} collections={settings.collections} />
        </header>
        <main>
          <Hero imageUrl={heroImage} />
          <ShopByCollection />
          <Carousel />
          <VisitUs />
          <Promo />
        </main>
        <SiteFooter />
        <ChatWidget />
        <EntryPopup popup={settings.popup} />
        <PDPModal />
        <WishDrawer />
        <CartDrawer />
        <Checkout bank={bank} />
      </div>
    </ShopProvider>
  );
}
