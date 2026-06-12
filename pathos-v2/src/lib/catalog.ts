// The same catalog as the original app (prisma/seed.ts), re-indexed by FEELING.
// Self-contained seed data so v2 runs with no database — this is a design
// prototype, not the production store.
import type { DiscountResult, Feeling, FeelingKey, StoreProduct } from "./types";

export const FEELINGS: Feeling[] = [
  { key: "eros", greek: "ΕΡΩΣ", roman: "Érōs", gloss: "desire", line: "The pieces you reach for when you want to be seen." },
  { key: "storge", greek: "ΣΤΟΡΓΗ", roman: "Storgē", gloss: "tenderness", line: "Given quietly, without waiting for an occasion." },
  { key: "pothos", greek: "ΠΟΘΟΣ", roman: "Póthos", gloss: "longing", line: "For the sea you keep returning to." },
];

export const feelingByKey = (k: FeelingKey): Feeling =>
  FEELINGS.find((f) => f.key === k) ?? FEELINGS[0];

// Prices in euros, exactly as the original seed. `feeling` is the v2 overlay.
export const PRODUCTS: StoreProduct[] = [
  { id: "PE-022", name: "Coral Drop Earrings", art: "earrings", collection: "Shells & Corals", price: 45, stock: 4, status: "Active", sold: 142, material: "Coral · Gold fill", swatches: ["#9b5a4a", "#a9824a", "#e6d6b8"], desc: "Mediterranean coral drops on gold-filled hooks — light as air, warm in tone.", feeling: "eros" },
  { id: "PN-031", name: "Hematite Pendant Necklace", art: "necklace", collection: "Hematite", price: 80, stock: 12, status: "Active", sold: 168, material: "Hematite · Silver 925", swatches: ["#4a4742", "#a9824a", "#cdb78f"], desc: "A faceted hematite drop on a fine sterling chain that catches the light with every movement.", feeling: "eros" },
  { id: "PR-009", name: "Chalcedony Signet Ring", art: "ring", collection: "Gemstones", price: 60, stock: 0, status: "Active", sold: 97, material: "Chalcedony · Silver 925", swatches: ["#7d9b94", "#a9824a", "#4a4742"], desc: "A soft blue chalcedony set flush in a hand-finished sterling signet.", feeling: "eros" },

  { id: "PN-040", name: "Olive Branch Choker", art: "necklace", collection: "Aegean", price: 58, stock: 31, status: "Active", sold: 119, material: "Brass · 24K plate", swatches: ["#a9824a", "#5b5b5b", "#cdb78f"], desc: "An olive-branch motif in gold-plated brass — a nod to Athenian summers.", feeling: "storge" },
  { id: "PS-046", name: "Spiral Shell Pendant", art: "shell", collection: "Shells & Corals", price: 36, stock: 56, status: "Active", sold: 203, material: "Shell · Gold fill", swatches: ["#e6d6b8", "#a9824a", "#9b5a4a"], desc: "A tiny spiral shell cast in gold-fill, strung on an adjustable cord.", feeling: "storge" },
  { id: "PB-051", name: "Lava Stone Wrap", art: "bracelet", collection: "Minerals", price: 34, stock: 9, status: "Active", sold: 76, material: "Lava · Leather", swatches: ["#141414", "#6f6f6f", "#a98c66"], desc: "Matte volcanic lava beads on a soft leather wrap — grounding and unisex.", feeling: "storge" },
  { id: "PR-028", name: "Moonstone Stacking Ring", art: "ring", collection: "Bridal", price: 48, stock: 0, status: "Draft", sold: 0, material: "Moonstone · Gold 14K", swatches: ["#dfe6ea", "#a9824a", "#cdb78f"], desc: "A milky moonstone on a slim 14K band, made to stack or stand alone.", feeling: "storge" },

  { id: "PD-017", name: "Paua Teardrop Pendant", art: "drop", collection: "Minerals", price: 42, stock: 21, status: "Active", sold: 88, material: "Paua · 24K plate", swatches: ["#5a6f6a", "#a9824a", "#4a4742"], desc: "Iridescent paua shell framed in 24K plate — no two are exactly alike.", feeling: "pothos" },
  { id: "PB-014", name: "Aegean Beaded Bracelet", art: "bracelet", collection: "Aegean", price: 52, stock: 38, status: "Active", sold: 214, material: "Hematite · 24K plate", swatches: ["#141414", "#5b5b5b", "#b8946b"], desc: "Smooth hematite beads strung by hand on a 24K-gold-plated thread — a weighty, everyday talisman from the Aegean shore.", feeling: "pothos" },
];

// Discounts, validated locally (the original validates server-side via /api).
const DISCOUNTS: DiscountResult[] = [
  { code: "WELCOME10", pct: 0.1, label: "10% off", freeShip: false },
  { code: "ATELIER20", pct: 0.2, label: "20% off", freeShip: false },
  { code: "AEGEAN15", pct: 0.15, label: "15% off your first order", freeShip: false },
  { code: "FREESHIP", pct: 0, label: "Free shipping", freeShip: true },
];

export function checkDiscount(code: string): DiscountResult | null {
  const c = code.trim().toUpperCase();
  return DISCOUNTS.find((d) => d.code === c) ?? null;
}

// Variant options per art type — ported verbatim from the original shop-context.
export function variantsFor(art: string): { label: string; opts: string[] } | null {
  if (art === "necklace") return { label: "Length", opts: ["40 cm", "45 cm", "50 cm"] };
  if (art === "ring") return { label: "Ring size", opts: ["50", "52", "54", "56"] };
  if (art === "bracelet") return { label: "Size", opts: ["S", "M", "L"] };
  return null;
}
