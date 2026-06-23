import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import type Stripe from "stripe";

// Stripe webhook. The /checkout/complete route records paid orders
// synchronously; this is the reconciliation seam — it verifies the signature
// and ensures the matching order is marked Paid even if the client dropped off.
// (Also where Klarna/async methods would finalize later.)
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 503 });
  }
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "bad signature";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await prisma.order
      .updateMany({
        where: { stripePaymentIntentId: pi.id, payment: { not: "Paid" } },
        data: { payment: "Paid" },
      })
      .catch(() => {});
  }

  return NextResponse.json({ received: true });
}
