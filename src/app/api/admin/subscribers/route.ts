import { NextResponse } from "next/server";
import { getSubscribers } from "@/lib/admin-data";

export async function GET() {
  return NextResponse.json({ subscribers: await getSubscribers() });
}
