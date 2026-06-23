// Pluggable image storage so product photos persist on serverless hosts
// (Vercel/Firebase have a read-only/ephemeral FS — local disk does NOT persist).
//
// Provider is chosen by env, no code change needed:
//   • Vercel Blob  → set BLOB_READ_WRITE_TOKEN   (npm i @vercel/blob)
//   • S3-compatible (Supabase Storage / Cloudflare R2 / AWS S3)
//       → set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
//         optional S3_ENDPOINT, S3_PUBLIC_URL   (npm i @aws-sdk/client-s3)
//   • else → local disk public/uploads  (development only; not for production)
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export function storageProvider(): "vercel-blob" | "s3" | "local-disk" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID) return "s3";
  return "local-disk";
}

// Returns a public URL for the stored image.
export async function putImage(filename: string, buffer: Buffer, contentType: string): Promise<string> {
  const provider = storageProvider();

  if (provider === "vercel-blob") {
    // @ts-ignore optional dependency — install with: npm i @vercel/blob
    const { put } = await import(/* webpackIgnore: true */ "@vercel/blob");
    const blob = await put(`products/${filename}`, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  if (provider === "s3") {
    // @ts-ignore optional dependency — install with: npm i @aws-sdk/client-s3
    const { S3Client, PutObjectCommand } = await import(/* webpackIgnore: true */ "@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: !!process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    const key = `products/${filename}`;
    await client.send(
      new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: buffer, ContentType: contentType }),
    );
    const base = (process.env.S3_PUBLIC_URL || `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`).replace(/\/$/, "");
    return `${base}/${key}`;
  }

  // Local disk. With UPLOAD_DIR set (e.g. a persistent disk at /data/uploads on
  // a single-host deploy) files persist across redeploys and are served by the
  // /media route; otherwise they go to public/uploads and are served statically
  // (local dev).
  if (process.env.UPLOAD_DIR) {
    await mkdir(process.env.UPLOAD_DIR, { recursive: true });
    await writeFile(join(process.env.UPLOAD_DIR, filename), buffer);
    return `/media/${filename}`;
  }
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  return `/uploads/${filename}`;
}
