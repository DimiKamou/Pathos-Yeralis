import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const schema = z.object({ approved: z.boolean() });

function notFound(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  try {
    await prisma.review.update({ where: { id }, data: { approved: data.approved } });
  } catch (err) {
    if (notFound(err)) return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
    throw err;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.review.delete({ where: { id } });
  } catch (err) {
    if (notFound(err)) return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
    throw err;
  }
  return NextResponse.json({ ok: true });
}
