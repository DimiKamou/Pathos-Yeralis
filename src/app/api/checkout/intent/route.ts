import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCart } from "@/lib/orders";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const schema = z.object({
  cart: z.array(z.object({ id: z.string(), variant: z.string().optional(), qty: z.number() })),
  discountCode: z.string().optional().nullable(),
  email: z.string().optional(),
  // When present, the existing intent's amount is updated instead of creating
  // a new one — so changing the discount mid-checkout keeps the same card field.
  paymentIntentId: z.string().optional().nullable(),
});

// Creates a Stripe PaymentIntent for the server-recomputed cart total. Powers
// both the Payment Element (card) and the Payment Request Button (Apple/Google
// Pay) — they share one clientSecret. Bank transfer skips this route.
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Stripe is not configured. Use bank transfer or set STRIPE_SECRET_KEY." },
      { status: 503 },
    );
  }
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid cart" }, { status: 400 });
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
  if (priced.totalCents < 50) {
    return NextResponse.json({ ok: false, error: "Order total is below the minimum" }, { status: 400 });
  }

  const stripe = getStripe();
  const metadata = { discountCode: priced.discount?.code ?? "", email: data.email ?? "" };

  let intent;
  if (data.paymentIntentId) {
    // Reuse the same intent (keeps the mounted card field) and just re-price.
    try {
      const current = await stripe.paymentIntents.retrieve(data.paymentIntentId);
      if (current.status === "requires_payment_method" || current.status === "requires_confirmation") {
        intent = await stripe.paymentIntents.update(data.paymentIntentId, {
          amount: priced.totalCents,
          metadata,
        });
      }
    } catch {
      /* fall through to create a fresh intent */
    }
  }
  if (!intent) {
    intent = await stripe.paymentIntents.create({
      amount: priced.totalCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata,
    });
  }

  return NextResponse.json({
    ok: true,
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    breakdown: {
      subtotalCents: priced.subtotalCents,
      discountCents: priced.discountCents,
      shippingCents: priced.shippingCents,
      totalCents: priced.totalCents,
      discount: priced.discount,
    },
  });
}
