// Public abandoned-cart capture. Fired (fire-and-forget) when a shopper moves
// from the Details step to Payment in checkout. Recomputes the cart server-side
// (never trusting client money) and upserts a snapshot keyed by email so the
// seller can follow up manually. Best-effort: never surfaces a 500 to the
// shopper — any failure returns { ok: false } and is silently swallowed.
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { priceCart } from "@/lib/orders";

const schema = z.object({
  email: z.string().email(),
  cart: z.array(z.object({ id: z.string(), variant: z.string().optional(), qty: z.number() })),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const email = data.email.toLowerCase();

    const priced = await priceCart(data.cart, null);
    if (priced.lines.length === 0) return NextResponse.json({ ok: true });

    const items = priced.lines.map((l) => ({ name: l.name, qty: l.qty }));
    const itemCount = priced.lines.reduce((s, l) => s + l.qty, 0);
    const valueCents = priced.subtotalCents;

    await prisma.abandonedCart.upsert({
      where: { email },
      update: { itemsJson: JSON.stringify(items), itemCount, valueCents, recovered: false, updatedAt: new Date() },
      create: { email, itemsJson: JSON.stringify(items), itemCount, valueCents },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never throw a 500 that could surface to the shopper.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
