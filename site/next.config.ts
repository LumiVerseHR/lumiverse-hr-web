import path from "node:path";
import type { NextConfig } from "next";

// The legacy site at the repo root has its own lockfile; pin tracing to this app
// so the standalone server lands at .next/standalone/server.js.
const appRoot = path.resolve(__dirname);

// Kept as the original static files (noindex, linked from nowhere).
const STATIC_PAGES = ["/brand-guide", "/brand-guide/assets", "/decks/tvrtko-agents", "/v/reel-38bf03"];

// The proxy marks its own rewrites to /en with x-lv-rewrite, so only visitor requests get redirected.
const visitorOnly = [{ type: "header" as const, key: "x-lv-rewrite" }];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: appRoot,
  turbopack: { root: appRoot },
  cacheComponents: true,
  partialPrefetching: true,

  async redirects() {
    return [
      // One canonical URL per English page: /en/x lives at /x.
      { source: "/en", destination: "/", permanent: true, missing: visitorOnly },
      { source: "/en/:path*", destination: "/:path*", permanent: true, missing: visitorOnly },
      // Legacy .html URLs, as nginx redirected them.
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/hr/index.html", destination: "/hr", permanent: true },
      { source: "/:path((?!brand-guide|decks/|v/|assets/).*)\\.html", destination: "/:path", permanent: true },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        ...STATIC_PAGES.map((page) => ({ source: page, destination: `${page}.html` })),
        // OG images moved from /images/og to /og; links already shared keep working.
        { source: "/images/og/:file", destination: "/og/:file" },
      ],
      afterFiles: [
        // The contact form keeps its own small, tested service (contact/server.mjs);
        // in production CONTACT_API_URL points at it on the internal network.
        { source: "/api/contact", destination: `${process.env.CONTACT_API_URL ?? "http://lumiverse-contact:3000"}/api/contact` },
      ],
      fallback: [],
    };
  },

  async headers() {
    const security = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    const longCache = [{ key: "Cache-Control", value: "public, max-age=2592000" }];
    return [
      { source: "/:path*", headers: security },
      ...STATIC_PAGES.map((page) => ({ source: page, headers: noindex })),
      // A <meta> robots tag can't reach a video file, so the header does.
      { source: "/assets/reel/:path*", headers: [...noindex, ...longCache] },
    ];
  },
};

export default nextConfig;
