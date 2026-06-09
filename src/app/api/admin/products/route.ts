import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";
import { getProductsAdmin } from "@/lib/admin-data";

export async function GET() {
  return NextResponse.json({ products: await getProductsAdmin() });
}

const ART_PREFIX: Record<string, string> = {
  bracelet: "PB",
  necklace: "PN",
  earrings: "PE",
  ring: "PR",
  shell: "PS",
  drop: "PD",
};

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  art: z.string().default("drop"),
  collection: z.string().default("Aegean"),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  status: z.enum(["Active", "Draft"]).default("Active"),
  sold: z.number().int().nonnegative().default(0),
  material: z.string().optional().nullable(),
  swatches: z.array(z.string()).default([]),
  desc: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid product" }, { status: 400 });
  }
  const id = data.id?.trim() || `${ART_PREFIX[data.art] || "PX"}-${Math.floor(100 + Math.random() * 900)}`;
  const count = await prisma.product.count();
  const product = await prisma.product.create({
    data: {
      id,
      name: data.name,
      art: data.art,
      collection: data.collection,
      priceCents: Math.round(data.price * 100),
      stock: data.stock,
      status: data.status,
      sold: data.sold,
      material: data.material ?? null,
      swatches: JSON.stringify(data.swatches),
      description: data.desc ?? null,
      imageUrl: data.imageUrl ?? null,
      position: count,
    },
  });
  return NextResponse.json({ ok: true, product: serializeProduct(product) });
}
