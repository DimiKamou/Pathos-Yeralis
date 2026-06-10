// Server-side cart pricing + order creation. Prices, names and the discount
// are ALWAYS recomputed from the DB here — never trusted from the client — so
// this is the single source of truth for money at checkout.
import { prisma } from "./prisma";
import { checkDiscount } from "./discounts";
import type { DiscountResult } from "./types";

export const SHIPPING_FLAT_CENTS = 500; // €5 flat, ported from the prototype
export const FREE_SHIPPING_THRESHOLD_CENTS = 10000; // €100

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
  totalCents: number;
}

// Recompute a cart from DB product data + a (server-validated) discount code.
export async function priceCart(
  cart: CartInput[],
  discountCode?: string | null,
): Promise<PricedCart> {
  const ids = [...new Set(cart.map((c) => c.id))];
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = [];
  for (const c of cart) {
    const p = byId.get(c.id);
    if (!p) continue; // silently drop unknown ids
    const qty = Math.max(1, Math.min(99, Math.floor(c.qty || 1)));
    const variant = c.variant ? String(c.variant) : null;
    lines.push({
      productId: p.id,
      art: p.art,
      name: p.name + (variant ? " · " + variant : ""),
      variant,
      qty,
      priceCents: p.priceCents,
    });
  }

  const subtotalCents = lines.reduce((s, l) => s + l.priceCents * l.qty, 0);
  const discount = await checkDiscount(discountCode);
  const discountCents = discount ? Math.round(subtotalCents * discount.pct) : 0;
  const freeShip = !!(discount && discount.freeShip);
  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS || freeShip || subtotalCents === 0
      ? 0
      : SHIPPING_FLAT_CENTS;
  const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents;

  return { lines, subtotalCents, discount, discountCents, shippingCents, totalCents };
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
}) {
  const { contact, priced, payment, method, stripePaymentIntentId } = params;
  const number = await nextOrderNumber();
  // Create the order AND adjust inventory atomically: each line decrements its
  // product's stock (floored at 0) and bumps `sold`. This is what keeps the
  // admin Inventory/Products stock figures up to date automatically.
  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        number,
        customer: contact.name || "Guest",
        email: contact.email,
        country: countryCode(contact.country),
        subtotalCents: priced.subtotalCents,
        shippingCents: priced.shippingCents,
        totalCents: priced.totalCents,
        payment,
        method,
        discountCode: priced.discount?.code ?? null,
        discountPct: priced.discount?.pct ?? null,
        discountCents: priced.discountCents || null,
        shipAddress: contact.address ?? null,
        shipCity: contact.city ?? null,
        shipZip: contact.zip ?? null,
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
    }),
    ...priced.lines.map((l) =>
      prisma.product.update({
        where: { id: l.productId },
        data: { stock: { decrement: l.qty }, sold: { increment: l.qty } },
      }),
    ),
  ]);

  // Guard against negative stock from races (SQLite has no per-row clamp).
  await prisma.product.updateMany({ where: { stock: { lt: 0 } }, data: { stock: 0 } });
  return order;
}
