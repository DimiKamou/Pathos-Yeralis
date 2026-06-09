import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeOrderForClient } from "@/lib/order-serialize";

const schema = z.object({
  payment: z.enum(["Paid", "Awaiting payment", "Refunded"]).optional(),
  fulfillment: z.enum(["Unfulfilled", "Shipped", "Delivered"]).optional(),
});

// Update order status — including marking a bank transfer Paid once it clears.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }
  const order = await prisma.order.update({
    where: { id },
    data,
    include: { lines: true },
  });
  return NextResponse.json({ ok: true, order: serializeOrderForClient(order) });
}
