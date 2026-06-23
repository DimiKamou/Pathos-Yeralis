import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeOrderForClient } from "@/lib/order-serialize";

const schema = z.object({ number: z.string().min(1), email: z.string().email() });

// Guest order lookup. Requires BOTH the order number and the matching email
// (prevents enumeration). Accepts "PA-1234", "#PA-1234" or "1234".
export async function POST(req: Request) {
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Enter an order number and email." }, { status: 400 });
  }
  const cleaned = data.number.trim().replace(/[#\s]/g, "").toUpperCase();
  const digits = data.number.replace(/\D/g, "");
  const order = await prisma.order.findFirst({
    where: { OR: [{ number: cleaned }, { number: "PA-" + digits }] },
    include: { lines: true },
  });
  if (!order || order.email.trim().toLowerCase() !== data.email.trim().toLowerCase()) {
    return NextResponse.json({ ok: false, error: "No order found with that number and email." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order: serializeOrderForClient(order) });
}
