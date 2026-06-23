import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMessages } from "@/lib/admin-data";

export async function GET() {
  return NextResponse.json({ messages: await getMessages() });
}

// Mark all as read.
export async function PATCH() {
  await prisma.message.updateMany({ where: { read: false }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
