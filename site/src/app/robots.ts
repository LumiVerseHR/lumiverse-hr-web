import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/decks/", "/v/", "/brand-guide"] }],
    sitemap: "https://www.lumiverse.hr/sitemap.xml",
    host: "https://www.lumiverse.hr",
  };
}
