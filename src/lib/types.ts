// Shared shapes. StoreProduct mirrors the prototype's product objects
// (note `price` is euros and the field is `desc`, as the UI expects).

export type ArtKey = "bracelet" | "necklace" | "earrings" | "ring" | "shell" | "drop";

export interface StoreProduct {
  id: string;
  name: string;
  art: string;
  collection: string;
  price: number; // euros
  stock: number;
  status: string; // Active | Draft
  sold: number;
  material: string | null;
  swatches: string[];
  desc: string | null;
  images: string[]; // gallery (uploaded photos)
  imageUrl: string | null; // primary = images[0]
}

export interface CartLine {
  key: string; // `${id}|${variant}`
  id: string;
  name: string;
  art: string;
  price: number; // euros
  variant: string;
  qty: number;
}

export interface DiscountResult {
  code: string;
  pct: number;
  label: string;
  freeShip?: boolean;
}

export type PaymentMethod = "card" | "apple" | "google" | "bank";

// ── Admin-editable settings (ported from pathos-store.js defaults) ──
export interface MenuItem {
  id: string;
  label: string;
  type: "page" | "collections" | "sale";
  enabled: boolean;
  system?: boolean;
}

export interface PopupSetting {
  enabled: boolean;
  heading: string;
  message: string;
  code: string;
  button: string;
  delay: number;
  frequency: "session" | "every";
}

export interface AnnouncementSetting {
  enabled: boolean;
  text: string;
}

export interface SeasonSetting {
  key: string;
  useGreeting: boolean;
  auto: boolean;
}

export interface ContactSetting {
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  hoursLine1: string;
  hoursLine2: string;
  mapLat: number;
  mapLng: number;
  mapLabel: string;
  instagram: string;
}

export interface FooterLink {
  label: string;
  href: string;
}
export interface FooterColumn {
  title: string;
  links: FooterLink[];
}
export interface FooterSetting {
  tagline: string;
  facebook: string;
  pinterest: string;
  columns: FooterColumn[];
}

export interface CommerceSetting {
  taxRatePct: number; // 0 = no tax line; e.g. 24 for 24% VAT
  taxIncluded: boolean; // true = displayed prices already include tax
  shippingFlatCents: number;
  freeShipThresholdCents: number;
}

export interface StoreSettings {
  menu: MenuItem[];
  collections: string[];
  contact: ContactSetting;
  footer: FooterSetting;
  commerce: CommerceSetting;
  popup: PopupSetting;
  announcement: AnnouncementSetting;
  season: SeasonSetting;
}
