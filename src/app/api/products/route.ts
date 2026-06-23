import { NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/products";

// Public catalog (the storefront page server-fetches directly; this is for
// client refresh / future use).
export async function GET() {
  const products = await getStoreProducts();
  return NextResponse.json({ products });
}
