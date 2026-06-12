import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isExport = process.env.EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This folder lives inside the original app's repo; pin tracing here so Next
  // doesn't infer the parent as the workspace root.
  outputFileTracingRoot: __dirname,
  // `EXPORT=1 npm run build` emits a static, relative-pathed bundle in ./out for
  // the shareable customer preview (works hosted in a subfolder).
  ...(isExport
    ? {
        output: "export",
        images: { unoptimized: true },
        trailingSlash: true,
        ...(process.env.BASE_PATH
          ? { basePath: process.env.BASE_PATH, assetPrefix: process.env.BASE_PATH }
          : {}),
      }
    : {}),
};

export default nextConfig;
