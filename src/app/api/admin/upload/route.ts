import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { putImage } from "@/lib/storage";

export const runtime = "nodejs";

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per file
const MAX_FILES = 8;

// Verify the file is really the image type it claims, by its magic bytes
// (client-supplied content-type is spoofable). Returns the true MIME or null.
function sniff(buf: Buffer): string | null {
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 4 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf.length >= 12 && buf.toString("ascii", 4, 8) === "ftyp") return "image/avif"; // avif/heic family
  return null;
}

// Multi-file product photo upload → public URLs via the configured store
// (Vercel Blob / S3 / local disk — see src/lib/storage.ts).
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart form data" }, { status: 400 });
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ ok: false, error: "No files" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ ok: false, error: `Up to ${MAX_FILES} files at once` }, { status: 413 });

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "File too large (max 8MB)" }, { status: 413 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const realType = sniff(buffer);
    if (!realType || !EXT[realType]) {
      return NextResponse.json({ ok: false, error: "Only real PNG/JPEG/WebP/AVIF/GIF images are allowed" }, { status: 415 });
    }
    const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${EXT[realType]}`;
    urls.push(await putImage(name, buffer, realType));
  }

  return NextResponse.json({ ok: true, urls });
}
