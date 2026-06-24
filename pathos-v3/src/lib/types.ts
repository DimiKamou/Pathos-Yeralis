// Shapes carried over from the original app (src/lib/types.ts), trimmed to what
// the storefront prototype needs. `feeling` is the v2-only attribute that drives
// the emotion-indexed catalog — the new structural device over the same data.

export interface StoreProduct {
  id: string;
  name: string;
  art: string; // line-art key: bracelet | necklace | earrings | ring | shell | drop
  collection: string;
  price: number; // euros
  stock: number;
  status: string; // Active | Draft
  sold: number;
  material: string | null;
  swatches: string[];
  desc: string | null;
  feeling: FeelingKey; // v2: which feeling this piece belongs to
}

export interface CartLine {
  key: string; // `${id}|${variant}`
  id: string;
  name: string;
  art: string;
  price: number;
  variant: string;
  qty: number;
}

export interface DiscountResult {
  code: string;
  pct: number;
  label: string;
  freeShip?: boolean;
}

export type FeelingKey = "eros" | "storge" | "pothos";

export interface Feeling {
  key: FeelingKey;
  greek: string; // ΕΡΩΣ
  roman: string; // Eros
  gloss: string; // desire
  line: string; // a one-line invitation
}
