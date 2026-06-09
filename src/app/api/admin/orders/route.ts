import { NextResponse } from "next/server";
import { getOrders } from "@/lib/admin-data";

export async function GET() {
  return NextResponse.json({ orders: await getOrders() });
}
