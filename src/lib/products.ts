// Product data access + serialization. The DB stores priceCents + description;
// the storefront expects `price` (euros) + `desc`, so we map at this boundary.
import { prisma } from "./prisma";
import type { StoreProduct } from "./types";
import type { Product } from "@prisma/client";

export function serializeProduct(p: Product): StoreProduct {
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
    swatches: p.swatches,
    desc: p.description,
    imageUrl: p.imageUrl,
  };
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(serializeProduct);
}
