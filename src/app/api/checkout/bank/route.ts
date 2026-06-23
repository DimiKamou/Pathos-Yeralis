import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { priceCart, createOrder, type ContactInput } from "@/lib/orders";
import { sendOrderEmail } from "@/lib/email";
import { serializeOrderForClient } from "@/lib/order-serialize";
import { BANK } from "@/lib/bank";

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

// Manual offline payment: create the order as "Awaiting payment" and email the
// IBAN + reference. An admin marks it Paid once the deposit clears.
export async function POST(req: Request) {
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
  let order;
  try {
    order = await createOrder({
      contact,
      priced,
      payment: "Awaiting payment",
      method: "Bank transfer",
      isGift: data.isGift,
      giftMessage: data.giftMessage,
    });
  } catch (e) {
    // Concurrency races that slip past the priceCart pre-check above.
    const code = (e as { code?: string }).code;
    if (code === "OUT_OF_STOCK") {
      return NextResponse.json({ ok: false, error: "Sorry — an item just sold out. Please review your cart." }, { status: 409 });
    }
    if (code === "DISCOUNT_LIMIT") {
      return NextResponse.json({ ok: false, error: "That discount code just reached its limit." }, { status: 409 });
    }
    throw e;
  }

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

  return NextResponse.json({ ok: true, order: serializeOrderForClient(order), bank: BANK });
}
