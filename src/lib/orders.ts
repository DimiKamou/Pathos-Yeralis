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
  const ids = [...new Set(cart.map((c) => c.id))];
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = [];
  const unavailable: { name: string; reason: string }[] = [];
  for (const c of cart) {
    const p = byId.get(c.id);
    if (!p) continue; // silently drop unknown ids
    const qty = Math.max(1, Math.min(99, Math.floor(c.qty || 1)));
    const variant = c.variant ? String(c.variant) : null;
    const name = p.name + (variant ? " · " + variant : "");
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
  // Atomic: create the order + lines, bump `sold`, and decrement stock ONLY
  // when there's enough (the `stock >= qty` guard means stock never goes
  // negative). `updateMany` is used so a product deleted mid-checkout can't
  // throw and roll back a paid order. Retries on an order-number collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = await nextOrderNumber();
    try {
      const [order] = await prisma.$transaction([
        prisma.order.create({
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
        }),
        ...priced.lines.map((l) =>
          prisma.product.updateMany({ where: { id: l.productId }, data: { sold: { increment: l.qty } } }),
        ),
        ...priced.lines.map((l) =>
          prisma.product.updateMany({ where: { id: l.productId, stock: { gte: l.qty } }, data: { stock: { decrement: l.qty } } }),
        ),
        ...(priced.discount ? [prisma.discount.updateMany({ where: { code: priced.discount.code }, data: { uses: { increment: 1 } } })] : []),
      ]);
      // Best-effort: mark any abandoned-cart snapshot for this email recovered.
      await prisma.abandonedCart.updateMany({ where: { email: contact.email.toLowerCase() }, data: { recovered: true } }).catch(() => {});
      return order;
    } catch (e) {
      // P2002 = unique violation on `number`; regenerate and retry.
      if ((e as { code?: string }).code === "P2002" && attempt < 4) continue;
      throw e;
    }
  }
  throw new Error("Could not allocate an order number");
}
