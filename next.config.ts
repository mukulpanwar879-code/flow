import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel auto-detects Next.js — no special config needed */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
