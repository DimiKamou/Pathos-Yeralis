// Product data access + serialization. The DB stores priceCents + description;
// the storefront expects `price` (euros) + `desc`, so we map at this boundary.
import { prisma } from "./prisma";
import type { StoreProduct } from "./types";
import type { Product } from "@prisma/client";

// JSON-text arrays (swatches, images) — portable across SQLite/Postgres.
export function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
export const parseSwatches = parseStringArray;

export function serializeProduct(p: Product): StoreProduct {
  const images = parseStringArray(p.images);
  return {
    id: p.id,
    name: p.name,
    art: p.art,
    collection: p.collection,
    price: p.priceCents / 100,
    stock: p.stock,
    status: p.status,
    sold: p.sold,
    material: p.material,
    swatches: parseStringArray(p.swatches),
    desc: p.description,
    images,
    imageUrl: images[0] ?? p.imageUrl, // primary photo = first gallery image
  };
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    where: { status: "Active" },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(serializeProduct);
}
