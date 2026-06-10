// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build artifact for low-RAM server deploys (build off-server, ship output).
  output: "standalone",
  images: {
    // Images are served same-origin directly by nginx (entity media) and Next's
    // /public (hero images). We skip Next's image optimizer: it would try to fetch
    // the external media dir from its own origin (404), and on this small server
    // runtime optimization is unwanted CPU/RAM load. The browser fetches images
    // straight from nginx (cached) instead.
    unoptimized: true,
  },
  // Enable experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
