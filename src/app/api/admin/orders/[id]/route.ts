import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeOrderForClient } from "@/lib/order-serialize";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendShippedEmail } from "@/lib/email";

const schema = z.object({
  payment: z.enum(["Paid", "Awaiting payment", "Refunded"]).optional(),
  fulfillment: z.enum(["Unfulfilled", "Shipped", "Delivered"]).optional(),
  trackingCarrier: z.string().max(60).nullable().optional(),
  trackingNumber: z.string().max(120).nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
});

// Update order status. Marking Refunded restocks the items (+ refunds via
// Stripe when possible); marking Shipped emails the customer.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id }, include: { lines: true } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  const becomingRefunded = data.payment === "Refunded" && existing.payment !== "Refunded";
  const becomingShipped = data.fulfillment === "Shipped" && existing.fulfillment !== "Shipped";

  if (becomingRefunded) {
    // Restock + decrement `sold` once (floored at 0).
    await prisma.$transaction(
      existing.lines
        .filter((l) => l.productId)
        .map((l) =>
          prisma.product.updateMany({
            where: { id: l.productId! },
            data: { stock: { increment: l.qty }, sold: { decrement: l.qty } },
          }),
        ),
    );
    await prisma.product.updateMany({ where: { sold: { lt: 0 } }, data: { sold: 0 } });
    // Best-effort Stripe refund (won't block the status change).
    if (existing.stripePaymentIntentId && isStripeConfigured()) {
      try {
        await getStripe().refunds.create({ payment_intent: existing.stripePaymentIntentId });
      } catch (err) {
        console.error("[refund] Stripe refund failed:", err);
      }
    }
  }

  const order = await prisma.order.update({ where: { id }, data, include: { lines: true } });

  if (becomingShipped) {
    await sendShippedEmail({
      number: order.number,
      customer: order.customer,
      email: order.email,
      trackingCarrier: order.trackingCarrier,
      trackingNumber: order.trackingNumber,
    });
  }

  return NextResponse.json({ ok: true, order: serializeOrderForClient(order) });
}
