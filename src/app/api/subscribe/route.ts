import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().email(),
  source: z.string().max(120).optional(),
});

// Newsletter / back-in-stock signups. Dedupes on email (like pushSubscriber).
export async function POST(req: Request) {
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ ok: true, deduped: true });
  await prisma.subscriber.create({ data: { email, source: data.source || "Footer" } });
  return NextResponse.json({ ok: true });
}
