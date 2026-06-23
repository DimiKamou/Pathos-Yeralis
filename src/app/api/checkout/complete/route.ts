import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { priceCart, createOrder, type ContactInput } from "@/lib/orders";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendOrderEmail } from "@/lib/email";
import { serializeOrderForClient } from "@/lib/order-serialize";

const schema = z.object({
  paymentIntentId: z.string(),
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
  method: z.enum(["card", "apple", "google"]).optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.string().max(500).optional().nullable(),
});

const METHOD_LABEL: Record<string, string> = {
  card: "Card",
  apple: "Apple Pay",
  google: "Google Pay",
};

// Finalizes a Stripe-paid order. Idempotent on the PaymentIntent id, and the
// intent must actually be `succeeded` before we record a Paid order.
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe is not configured" }, { status: 503 });
  }
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Idempotency: return the existing order if this intent was already recorded.
  const existing = await prisma.order.findUnique({
    where: { stripePaymentIntentId: data.paymentIntentId },
    include: { lines: true },
  });
  if (existing) {
    return NextResponse.json({ ok: true, order: serializeOrderForClient(existing) });
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(data.paymentIntentId);
  if (intent.status !== "succeeded") {
    return NextResponse.json(
      { ok: false, error: `Payment not completed (status: ${intent.status})` },
      { status: 402 },
    );
  }

  const priced = await priceCart(data.cart, data.discountCode);
  if (priced.lines.length === 0) {
    return NextResponse.json({ ok: false, error: "Your bag is empty" }, { status: 400 });
  }

  // Security: the amount actually captured by Stripe must equal the
  // server-recomputed total. Otherwise a tampered/stale cart could record a
  // different total than was charged.
  if (intent.amount !== priced.totalCents || intent.currency !== "eur") {
    return NextResponse.json(
      { ok: false, error: "Payment amount mismatch — please contact support.", code: "amount_mismatch" },
      { status: 409 },
    );
  }

  const contact: ContactInput = data.contact;
  const method = METHOD_LABEL[data.method ?? "card"] ?? "Card";
  const order = await createOrder({
    contact,
    priced,
    payment: "Paid",
    method,
    stripePaymentIntentId: intent.id,
    isGift: data.isGift,
    giftMessage: data.giftMessage,
  });

  // Best-effort side effects (never block the confirmation).
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
