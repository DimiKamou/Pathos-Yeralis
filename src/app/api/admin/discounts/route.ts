import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDiscounts } from "@/lib/admin-data";

export async function GET() {
  return NextResponse.json({ discounts: await getDiscounts() });
}

const schema = z.object({
  code: z.string().min(2),
  pct: z.number().min(0).max(1),
  label: z.string().min(1),
  freeShip: z.boolean().default(false),
  active: z.boolean().default(true),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function POST(req: Request) {
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid discount" }, { status: 400 });
  }
  const code = data.code.trim().toUpperCase();
  const discount = await prisma.discount.upsert({
    where: { code },
    update: { pct: data.pct, label: data.label, freeShip: data.freeShip, active: data.active, maxUses: data.maxUses ?? null, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
    create: { code, pct: data.pct, label: data.label, freeShip: data.freeShip, active: data.active, maxUses: data.maxUses ?? null, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
  });
  return NextResponse.json({ ok: true, discount });
}
