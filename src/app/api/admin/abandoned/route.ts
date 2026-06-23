import { NextResponse } from "next/server";
import { getAbandonedCarts } from "@/lib/admin-data";

export async function GET() {
  return NextResponse.json({ carts: await getAbandonedCarts() });
}
