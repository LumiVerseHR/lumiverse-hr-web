import path from "node:path";
import type { NextConfig } from "next";

// The legacy site at the repo root has its own lockfile; pin tracing to this app
// so the standalone server lands at .next/standalone/server.js.
const appRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: appRoot,
  turbopack: { root: appRoot },
  cacheComponents: true,
  partialPrefetching: true,
  // One canonical URL per English page: /en/x lives at /x. The proxy marks its own
  // rewrites to /en with x-lv-rewrite, so only visitor requests get redirected.
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true, missing: [{ type: "header", key: "x-lv-rewrite" }] },
      { source: "/en/:path*", destination: "/:path*", permanent: true, missing: [{ type: "header", key: "x-lv-rewrite" }] },
    ];
  },
};

export default nextConfig;
