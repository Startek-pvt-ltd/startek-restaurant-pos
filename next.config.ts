import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/security-headers";

// Exclude local filesystem backup operations from cloud builds.
const cloud = process.env.POS_BUILD_TARGET === "cloud" ||
  process.env.POS_DEPLOYMENT === "cloud";
const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS.map(({ key, value }) => ({ key, value })) }];
  },
  // Serve packaged assets directly on Netlify, including 1-bit receipt logos.
  ...(cloud ? { images: { unoptimized: true } } : {}),
  turbopack: {
    root: process.cwd(),
    resolveAlias: cloud ? {
      "@/features/backup/services/local-backup-service":
        "./src/features/backup/services/managed-backup-service.ts",
    } : {},
  },
};
export default nextConfig;
