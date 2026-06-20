import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  pct: z.number().min(0).max(1).optional(),
  label: z.string().optional(),
  freeShip: z.boolean().optional(),
  active: z.boolean().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  const updateData = {
    ...data,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt === null ? null : undefined,
  };
  let discount;
  try {
    discount = await prisma.discount.update({ where: { code: code.toUpperCase() }, data: updateData });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    throw err;
  }
  return NextResponse.json({ ok: true, discount });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    await prisma.discount.delete({ where: { code: code.toUpperCase() } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    throw err;
  }
  return NextResponse.json({ ok: true });
}
