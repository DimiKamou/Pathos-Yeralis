import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { priceCart, createOrder, type ContactInput } from "@/lib/orders";
import { isStripeConfigured } from "@/lib/stripe";
import { sendOrderEmail } from "@/lib/email";
import { serializeOrderForClient } from "@/lib/order-serialize";

const schema = z.object({
  cart: z.array(z.object({ id: z.string(), variant: z.string().optional(), qty: z.number() })),
  discountCode: z.string().optional().nullable(),
  contact: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }),
  isGift: z.boolean().optional(),
  giftMessage: z.string().max(500).optional().nullable(),
});

// OFFLINE DEMO ONLY: simulates a successful card payment so the full
// card → "Thank you" → admin flow can be tested without Stripe or a network.
// Hard-disabled whenever Stripe IS configured, so it can never run in prod.
export async function POST(req: Request) {
  if (isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Demo payments are disabled when Stripe is configured." }, { status: 403 });
  }
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const priced = await priceCart(data.cart, data.discountCode);
  if (priced.lines.length === 0) {
    return NextResponse.json({ ok: false, error: "Your bag is empty" }, { status: 400 });
  }
  if (!priced.allAvailable) {
    return NextResponse.json(
      { ok: false, error: "Some items are no longer available", unavailable: priced.unavailable },
      { status: 409 },
    );
  }

  const contact: ContactInput = data.contact;
  const order = await createOrder({ contact, priced, payment: "Paid", method: "Card (demo)", isGift: data.isGift, giftMessage: data.giftMessage });

  await prisma.subscriber
    .upsert({
      where: { email: contact.email.toLowerCase() },
      update: {},
      create: { email: contact.email.toLowerCase(), source: "Checkout" },
    })
    .catch(() => {});
  await sendOrderEmail({
    number: order.number,
    customer: order.customer,
    email: order.email,
    payment: order.payment,
    method: order.method,
    totalEur: order.totalCents / 100,
    lines: order.lines.map((l) => ({ name: l.name, qty: l.qty, priceEur: l.priceCents / 100 })),
  });

  return NextResponse.json({ ok: true, order: serializeOrderForClient(order) });
}
