import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllSettings, saveSetting } from "@/lib/settings";
import type { StoreSettings } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ settings: await getAllSettings() });
}

const schema = z.object({
  key: z.enum(["menu", "collections", "contact", "footer", "popup", "announcement", "season"]),
  value: z.unknown(),
});

// Persist one settings group (menu | popup | announcement | season).
export async function PUT(req: Request) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid setting" }, { status: 400 });
  }
  await saveSetting(body.key as keyof StoreSettings, body.value as never);
  return NextResponse.json({ ok: true });
}
