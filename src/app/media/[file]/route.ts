// Serves product photos that were saved outside public/ — i.e. on a persistent
// disk (UPLOAD_DIR, e.g. /data/uploads on a single-host deploy) so they survive
// redeploys. Read-only, images only, with path-traversal protection.
import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

export const dynamic = "force-dynamic";

const DIR = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const safe = basename(file); // strip any path components → no traversal
  const type = TYPES[extname(safe).toLowerCase()];
  if (!type || safe !== file) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(join(DIR, safe));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
