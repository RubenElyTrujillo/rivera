import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["media.base44.com", "images.unsplash.com"],
  }
};

export default nextConfig;
