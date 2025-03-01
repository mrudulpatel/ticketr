import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "hearty-basilisk-388.convex.cloud",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
