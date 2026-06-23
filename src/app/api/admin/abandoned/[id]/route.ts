import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.abandonedCart.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
