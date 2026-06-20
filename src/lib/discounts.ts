// Discount codes — ported from the DISCOUNTS map + checkDiscount() in
// pathos-store.js. Validation runs server-side (used by the cart UI via
// /api/discount and re-checked at checkout). Honors both the Discount table
// and the live welcome-popup code, whose percentage is parsed from its message.
import { prisma } from "./prisma";
import { getSetting } from "./settings";
import type { DiscountResult } from "./types";

// Seed defaults (also written to the Discount table by prisma/seed.ts).
export const DEFAULT_DISCOUNTS: Record<string, Omit<DiscountResult, "code">> = {
  WELCOME10: { pct: 0.1, label: "10% off" },
  ATELIER20: { pct: 0.2, label: "20% off" },
  FREESHIP: { pct: 0, label: "Free shipping", freeShip: true },
};

export async function checkDiscount(raw: string | null | undefined): Promise<DiscountResult | null> {
  const code = (raw || "").trim().toUpperCase();
  if (!code) return null;

  // 1) Live welcome-popup code wins (percentage read from its message text).
  try {
    const popup = await getSetting("popup");
    if (popup && popup.code && popup.code.toUpperCase() === code && popup.enabled) {
      const m = (popup.message || "").match(/(\d{1,2})\s*%/);
      // No percentage in the popup message → no discount (don't silently grant 15%).
      if (!m) return null;
      // Clamp to a sane max so a typo'd popup ("90% off") can't near-zero an order.
      const pct = Math.min(0.5, Number(m[1]) / 100);
      return { code, pct, label: Math.round(pct * 100) + "% off" };
    }
  } catch {
    /* ignore */
  }

  // 2) Codes from the Discount table.
  const row = await prisma.discount.findUnique({ where: { code } });
  if (row && row.active) {
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
    if (row.maxUses != null && row.uses >= row.maxUses) return null;
    return { code, pct: row.pct, label: row.label, freeShip: row.freeShip || undefined };
  }
  return null;
}

// Recompute the monetary effect of a discount on a subtotal (euros).
export function discountAmount(subtotal: number, d: DiscountResult | null): number {
  return d ? +(subtotal * d.pct).toFixed(2) : 0;
}
