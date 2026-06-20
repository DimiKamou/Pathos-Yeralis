import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
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
  images: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid product" }, { status: 400 });
  }
  let product;
  try {
    product = await prisma.product.update({
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
        ...(data.swatches !== undefined && { swatches: JSON.stringify(data.swatches) }),
        ...(data.desc !== undefined && { description: data.desc }),
        ...(data.images !== undefined && { images: JSON.stringify(data.images), imageUrl: data.images[0] ?? null }),
        ...(data.imageUrl !== undefined && data.images === undefined && { imageUrl: data.imageUrl }),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    throw err;
  }
  return NextResponse.json({ ok: true, product: serializeProduct(product) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
      }
      if (err.code === "P2003") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "This product is part of existing orders and can't be deleted. Set it to Draft to hide it instead.",
          },
          { status: 409 },
        );
      }
    }
    throw err;
  }
  return NextResponse.json({ ok: true });
}
