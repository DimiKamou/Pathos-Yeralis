import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Approved reviews for a product, newest first.
export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ reviews: [] });
  const rows = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, rating: true, name: true, body: true, createdAt: true },
  });
  return NextResponse.json({
    reviews: rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      name: r.name,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  name: z.string().min(1),
  body: z.string().min(1),
});

// Shopper-submitted review → pending moderation (approved:false).
export async function POST(req: Request) {
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid review" }, { status: 400 });
  }
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  await prisma.review.create({
    data: {
      productId: data.productId,
      rating: data.rating,
      name: data.name.trim(),
      body: data.body.trim(),
      approved: false,
    },
  });
  return NextResponse.json({ ok: true });
}
