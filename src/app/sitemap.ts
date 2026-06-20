import type { MetadataRoute } from "next";
import { getAllSettings } from "@/lib/settings";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();
  let collections: string[] = [];
  try {
    collections = (await getAllSettings()).collections;
  } catch {
    /* DB unavailable at build — ship the static routes only */
  }
  const staticPaths = ["", "/shop", "/collections", "/about"];
  return [
    ...staticPaths.map((p) => ({ url: base + p, lastModified: now })),
    ...collections.map((c) => ({ url: `${base}/collections/${slugify(c)}`, lastModified: now })),
  ];
}
