import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().email(),
  topic: z.string().optional(),
  message: z.string().trim().min(2).max(5000),
});

// Live-chat / contact form → admin inbox (was PathosStore.pushMessage).
export async function POST(req: Request) {
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid message" }, { status: 400 });
  }
  await prisma.message.create({
    data: {
      name: data.name || null,
      email: data.email.trim().toLowerCase(),
      topic: data.topic || "General",
      message: data.message.trim(),
    },
  });
  return NextResponse.json({ ok: true });
}
