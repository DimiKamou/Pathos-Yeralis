import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSetting, saveSetting } from "@/lib/settings";
import { slugify } from "@/lib/slug";

// Collections are the admin-managed list in the "collections" setting (also the
// storefront dropdown + each collection page). Renaming cascades to products.
export async function GET() {
  const [names, products] = await Promise.all([
    getSetting("collections"),
    prisma.product.findMany({ select: { collection: true, status: true } }),
  ]);
  const collections = names.map((name) => ({
    name,
    count: products.filter((p) => slugify(p.collection) === slugify(name)).length,
  }));
  return NextResponse.json({ collections });
}

const addSchema = z.object({ name: z.string().min(1) });
export async function POST(req: Request) {
  let data: z.infer<typeof addSchema>;
  try {
    data = addSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
  }
  const name = data.name.trim();
  const list = await getSetting("collections");
  if (!list.some((c) => slugify(c) === slugify(name))) {
    await saveSetting("collections", [...list, name]);
  }
  return NextResponse.json({ ok: true });
}

const renameSchema = z.object({ from: z.string().min(1), to: z.string().min(1) });
export async function PATCH(req: Request) {
  let data: z.infer<typeof renameSchema>;
  try {
    data = renameSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  const from = data.from.trim();
  const to = data.to.trim();
  const list = await getSetting("collections");
  await saveSetting("collections", list.map((c) => (c === from ? to : c)));
  // Cascade to products that belong to the renamed collection.
  const { count } = await prisma.product.updateMany({ where: { collection: from }, data: { collection: to } });
  return NextResponse.json({ ok: true, productsUpdated: count });
}

const delSchema = z.object({ name: z.string().min(1) });
export async function DELETE(req: Request) {
  let data: z.infer<typeof delSchema>;
  try {
    data = delSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
  }
  const list = await getSetting("collections");
  await saveSetting("collections", list.filter((c) => c !== data.name.trim()));
  return NextResponse.json({ ok: true });
}
