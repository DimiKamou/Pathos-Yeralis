import { NextResponse } from "next/server";
import { checkDiscount } from "@/lib/discounts";

// Server-side discount validation (cart + checkout call this).
export async function POST(req: Request) {
  let code = "";
  try {
    const body = await req.json();
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    /* ignore */
  }
  const discount = await checkDiscount(code);
  return NextResponse.json({ discount });
}
