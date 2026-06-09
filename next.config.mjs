/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow remote product photography (e.g. Supabase/S3/Cloudinary) for the alpha.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
