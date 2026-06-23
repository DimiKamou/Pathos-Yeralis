import { NextResponse } from "next/server";
import { getReviews } from "@/lib/admin-data";

export async function GET() {
  return NextResponse.json({ reviews: await getReviews() });
}
