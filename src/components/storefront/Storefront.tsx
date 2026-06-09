"use client";

// The landing page body, wrapped in the shared StoreShell.
import { StoreShell } from "./StoreShell";
import { Hero } from "./Hero";
import { ShopByCollection, Carousel, Promo } from "./Sections";
import { VisitUs } from "./VisitUs";
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
    <StoreShell products={products} settings={settings} bank={bank}>
      <main>
        <Hero imageUrl={heroImage} />
        <ShopByCollection />
        <Carousel />
        <VisitUs />
        <Promo />
      </main>
    </StoreShell>
  );
}
