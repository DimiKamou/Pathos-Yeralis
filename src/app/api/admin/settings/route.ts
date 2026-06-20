import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllSettings, saveSetting } from "@/lib/settings";
import type { StoreSettings } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ settings: await getAllSettings() });
}

// Per-key value schemas so a malformed PUT can't poison storefront reads.
const valueSchemas = {
  menu: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(["page", "collections", "sale"]),
      enabled: z.boolean(),
      system: z.boolean().optional(),
    }),
  ),
  collections: z.array(z.string()),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string(),
    hoursLine1: z.string(),
    hoursLine2: z.string(),
    mapLat: z.number(),
    mapLng: z.number(),
    mapLabel: z.string(),
    instagram: z.string(),
  }),
  footer: z.object({
    tagline: z.string(),
    facebook: z.string(),
    pinterest: z.string(),
    columns: z.array(
      z.object({ title: z.string(), links: z.array(z.object({ label: z.string(), href: z.string() })) }),
    ),
  }),
  commerce: z.object({
    taxRatePct: z.number().min(0).max(100),
    taxIncluded: z.boolean(),
    shippingFlatCents: z.number().int().min(0),
    freeShipThresholdCents: z.number().int().min(0),
  }),
  popup: z.object({
    enabled: z.boolean(),
    heading: z.string(),
    message: z.string(),
    code: z.string(),
    button: z.string(),
    delay: z.number(),
    frequency: z.enum(["session", "every"]),
  }),
  announcement: z.object({ enabled: z.boolean(), text: z.string() }),
  season: z.object({ key: z.string(), useGreeting: z.boolean(), auto: z.boolean() }),
} as const;

type SettingKey = keyof typeof valueSchemas;

// Persist one settings group with its value validated against the key's schema.
export async function PUT(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const keyParse = z
    .object({ key: z.enum(Object.keys(valueSchemas) as [SettingKey, ...SettingKey[]]) })
    .safeParse(raw);
  if (!keyParse.success) {
    return NextResponse.json({ ok: false, error: "Unknown setting key" }, { status: 400 });
  }
  const key = keyParse.data.key;
  const valParse = valueSchemas[key].safeParse((raw as { value?: unknown }).value);
  if (!valParse.success) {
    return NextResponse.json({ ok: false, error: `Invalid value for "${key}"` }, { status: 400 });
  }
  await saveSetting(key as keyof StoreSettings, valParse.data as never);
  return NextResponse.json({ ok: true });
}
