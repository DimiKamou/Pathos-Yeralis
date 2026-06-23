// Server-side cart pricing + order creation. Prices, names and the discount
// are ALWAYS recomputed from the DB here — never trusted from the client — so
// this is the single source of truth for money at checkout.
import { prisma } from "./prisma";
import { checkDiscount } from "./discounts";
import { getSetting } from "./settings";
import type { DiscountResult } from "./types";

export interface CartInput {
  id: string;
  variant?: string;
  qty: number;
}

export interface PricedLine {
  productId: string;
  art: string;
  name: string; // includes " · variant" suffix when present
  variant: string | null;
  qty: number;
  priceCents: number;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotalCents: number;
  discount: DiscountResult | null;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  taxIncluded: boolean;
  totalCents: number;
  allAvailable: boolean;
  unavailable: { name: string; reason: string }[];
}

// Recompute a cart from DB product data + a (server-validated) discount code.
// Also reports availability (Active status + enough stock) so the caller can
// refuse to charge for sold-out / draft / oversold items BEFORE taking money.
export async function priceCart(
  cart: CartInput[],
  discountCode?: string | null,
): Promise<PricedCart> {
  // Cap cart size to prevent resource-exhaustion (e.g. a 10,000-line order):
  // only ever process the first 100 entries.
  const boundedCart = cart.slice(0, 100);
  const ids = [...new Set(boundedCart.map((c) => c.id))];
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = [];
  const unavailable: { name: string; reason: string }[] = [];
  for (const c of boundedCart) {
    const p = byId.get(c.id);
    if (!p) continue; // silently drop unknown ids
    const variant = c.variant ? String(c.variant) : null;
    const name = p.name + (variant ? " · " + variant : "");
    // Reject non-positive / non-integer / NaN quantities instead of silently
    // coercing them to 1 — such a line is treated as UNAVAILABLE so the order
    // is refused (allAvailable=false) rather than charged as qty 1. The upper
    // bound is still clamped at 99.
    if (!Number.isInteger(c.qty) || c.qty < 1) {
      unavailable.push({ name, reason: "invalid quantity" });
      continue;
    }
    const qty = Math.min(99, c.qty);
    if (p.status !== "Active") unavailable.push({ name, reason: "no longer available" });
    else if (p.stock < qty) unavailable.push({ name, reason: p.stock <= 0 ? "out of stock" : `only ${p.stock} left` });
    lines.push({ productId: p.id, art: p.art, name, variant, qty, priceCents: p.priceCents });
  }

  const commerce = await getSetting("commerce");

  const subtotalCents = lines.reduce((s, l) => s + l.priceCents * l.qty, 0);
  const discount = await checkDiscount(discountCode);
  const discountCents = discount ? Math.round(subtotalCents * discount.pct) : 0;
  const freeShip = !!(discount && discount.freeShip);
  const shippingCents =
    subtotalCents >= commerce.freeShipThresholdCents || freeShip || subtotalCents === 0
      ? 0
      : commerce.shippingFlatCents;

  // Tax is computed on the subtotal after discount. When prices already include
  // tax it's purely informational (the extracted portion); otherwise it's added
  // on top of the total. Shipping is left untaxed to match the prototype.
  const taxIncluded = commerce.taxIncluded;
  const rate = commerce.taxRatePct > 0 ? commerce.taxRatePct / 100 : 0;
  const taxableBase = Math.max(0, subtotalCents - discountCents);
  const taxCents =
    rate <= 0
      ? 0
      : taxIncluded
        ? Math.round(taxableBase - taxableBase / (1 + rate))
        : Math.round(taxableBase * rate);
  const totalCents = taxableBase + shippingCents + (taxIncluded ? 0 : taxCents);

  return {
    lines,
    subtotalCents,
    discount,
    discountCents,
    shippingCents,
    taxCents,
    taxIncluded,
    totalCents,
    allAvailable: unavailable.length === 0,
    unavailable,
  };
}

// Generate a unique human-readable order number, e.g. "PA-2842".
export async function nextOrderNumber(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const n = Math.floor(2842 + Math.random() * 5000);
    const number = "PA-" + n;
    const existing = await prisma.order.findUnique({ where: { number } });
    if (!existing) return number;
  }
  return "PA-" + Date.now().toString().slice(-6);
}

export interface ContactInput {
  name: string;
  email: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string; // full name or code
}

const COUNTRY_CODE: Record<string, string> = {
  Greece: "GR",
  Germany: "DE",
  France: "FR",
  Italy: "IT",
  Ireland: "IE",
  Netherlands: "NL",
  Spain: "ES",
  Portugal: "PT",
};

export function countryCode(country?: string): string {
  if (!country) return "GR";
  return COUNTRY_CODE[country] || (country.length === 2 ? country.toUpperCase() : "GR");
}

// Create the order + its lines in one transaction.
export async function createOrder(params: {
  contact: ContactInput;
  priced: PricedCart;
  payment: "Paid" | "Awaiting payment";
  method: string; // Card | Apple Pay | Google Pay | Bank transfer
  stripePaymentIntentId?: string | null;
  isGift?: boolean;
  giftMessage?: string | null;
}) {
  const { contact, priced, payment, method, stripePaymentIntentId, isGift, giftMessage } = params;
  // Atomic + race-safe: an INTERACTIVE transaction that (1) for each line moves
  // `stock` and `sold` together with a guarded `updateMany` and verifies exactly
  // one row changed (so the last unit can never be oversold and `sold` stays in
  // sync), (2) guards the discount `maxUses` cap with a conditional UPDATE, and
  // only then (3) creates the order + lines. Any guard failure throws and rolls
  // the whole transaction back, so no order is created. Retries on an order
  // number collision (P2002) AND on transient DB contention (e.g. SQLite write
  // locks / socket timeouts under concurrent checkout) — OUT_OF_STOCK /
  // DISCOUNT_LIMIT are business rejections and propagate immediately.
  for (let attempt = 0; attempt < 8; attempt++) {
    const number = await nextOrderNumber();
    try {
      const order = await prisma.$transaction(async (tx) => {
        // 1) Guarded stock decrement + sold increment, together, per line.
        for (const l of priced.lines) {
          const res = await tx.product.updateMany({
            where: { id: l.productId, status: "Active", stock: { gte: l.qty } },
            data: { stock: { decrement: l.qty }, sold: { increment: l.qty } },
          });
          if (res.count !== 1) {
            const e = new Error("OUT_OF_STOCK");
            (e as Error & { code?: string }).code = "OUT_OF_STOCK";
            throw e;
          }
        }

        // 2) Guarded discount-usage cap. 0 rows means either a popup/non-table
        // code (no row → fine, skip) OR a table code that just hit its cap (reject).
        if (priced.discount) {
          const updated = await tx.$executeRaw`UPDATE "Discount" SET "uses" = "uses" + 1 WHERE "code" = ${priced.discount.code} AND ("maxUses" IS NULL OR "uses" < "maxUses")`;
          if (updated === 0) {
            const row = await tx.discount.findUnique({ where: { code: priced.discount.code } });
            if (row) {
              const e = new Error("DISCOUNT_LIMIT");
              (e as Error & { code?: string }).code = "DISCOUNT_LIMIT";
              throw e;
            }
          }
        }

        // 3) Create the order + lines.
        const order = await tx.order.create({
          data: {
            number,
            customer: contact.name || "Guest",
            email: contact.email,
            country: countryCode(contact.country),
            subtotalCents: priced.subtotalCents,
            shippingCents: priced.shippingCents,
            taxCents: priced.taxCents,
            totalCents: priced.totalCents,
            payment,
            method,
            discountCode: priced.discount?.code ?? null,
            discountPct: priced.discount?.pct ?? null,
            discountCents: priced.discountCents || null,
            shipAddress: contact.address ?? null,
            shipCity: contact.city ?? null,
            shipZip: contact.zip ?? null,
            isGift: isGift ?? false,
            giftMessage: isGift ? (giftMessage?.trim() || null) : null,
            stripePaymentIntentId: stripePaymentIntentId ?? null,
            lines: {
              create: priced.lines.map((l) => ({
                productId: l.productId,
                art: l.art,
                name: l.name,
                variant: l.variant,
                qty: l.qty,
                priceCents: l.priceCents,
              })),
            },
          },
          include: { lines: true },
        });
        return order;
      }, { timeout: 15000, maxWait: 10000 });
      // Best-effort: mark any abandoned-cart snapshot for this email recovered.
      await prisma.abandonedCart.updateMany({ where: { email: contact.email.toLowerCase() }, data: { recovered: true } }).catch(() => {});
      return order;
    } catch (e) {
      const code = (e as { code?: string }).code;
      // Business rejections must never be retried — propagate to the caller.
      if (code === "OUT_OF_STOCK" || code === "DISCOUNT_LIMIT") throw e;
      // Retry on order-number collisions and transient DB contention (SQLite
      // write-lock / socket timeout / deadlock) with jittered backoff. This
      // turns a burst of concurrent checkouts into success-or-clean-OUT_OF_STOCK
      // instead of a 500.
      const msg = (e as { message?: string }).message || "";
      const transient =
        code === "P2002" || code === "P2024" || code === "P2028" || code === "P2034" || code === "P1008" ||
        /socket timeout|database is locked|timed out|deadlock|write conflict/i.test(msg);
      if (transient && attempt < 7) {
        await new Promise((r) => setTimeout(r, 30 + Math.floor(Math.random() * 90) * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw new Error("Could not place the order — please try again");
}
