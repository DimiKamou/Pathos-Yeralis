import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

const ACCEPT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per file

// Multi-file image upload for product photos. Saves to /public/uploads and
// returns public URLs. ALPHA: local disk (works in dev + a persistent server).
// For Vercel/Firebase production, swap this for a blob store (S3, Supabase
// Storage, Cloudinary, Firebase Storage) — only this handler changes.
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart form data" }, { status: 400 });
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files" }, { status: 400 });
  }

  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const ext = ACCEPT[file.type];
    if (!ext) return NextResponse.json({ ok: false, error: `Unsupported type: ${file.type}` }, { status: 415 });
    if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "File too large (max 8MB)" }, { status: 413 });
    const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, name), buffer);
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ ok: true, urls });
}
