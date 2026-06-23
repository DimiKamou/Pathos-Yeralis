/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow remote product photography (e.g. Supabase/S3/Cloudinary) for the alpha.
    // Before launch, narrow this to your actual image host(s).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Allow Stripe's wallet (Apple/Google Pay) to use the Payment Request API.
          { key: "Permissions-Policy", value: 'payment=(self "https://js.stripe.com"), camera=(), microphone=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
