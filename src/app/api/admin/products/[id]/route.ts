import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";

const schema = z.object({
  name: z.string().optional(),
  art: z.string().optional(),
  collection: z.string().optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  status: z.enum(["Active", "Draft"]).optional(),
  sold: z.number().int().nonnegative().optional(),
  material: z.string().nullable().optional(),
  swatches: z.array(z.string()).optional(),
  desc: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid product" }, { status: 400 });
  }
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.art !== undefined && { art: data.art }),
      ...(data.collection !== undefined && { collection: data.collection }),
      ...(data.price !== undefined && { priceCents: Math.round(data.price * 100) }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.sold !== undefined && { sold: data.sold }),
      ...(data.material !== undefined && { material: data.material }),
      ...(data.swatches !== undefined && { swatches: data.swatches }),
      ...(data.desc !== undefined && { description: data.desc }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    },
  });
  return NextResponse.json({ ok: true, product: serializeProduct(product) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
