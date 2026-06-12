import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This folder lives inside the original app's repo; pin tracing here so Next
  // doesn't infer the parent as the workspace root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
