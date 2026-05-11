import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Apple Store (preview/mock images)
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
      },
      // Supabase Storage (production images)
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Generic HTTPS images
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
