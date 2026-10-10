import type { MetadataRoute } from "next";
import { flagships, workIndex } from "@/content/work";
import { localePath } from "@/i18n/config";
import { allPosts } from "@/lib/posts";

const SITE = "https://www.lumiverse.hr";

// Every page in both languages, each entry naming its translation (hreflang).
// Priorities follow the homepage order, as the legacy sitemap did.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pair = (path: string, priority: number): MetadataRoute.Sitemap => {
    const languages = { en: `${SITE}${localePath("en", path)}`, hr: `${SITE}${localePath("hr", path)}` };
    return (["en", "hr"] as const).map((lang) => ({
      url: languages[lang],
      priority,
      changeFrequency: "monthly" as const,
      alternates: { languages },
    }));
  };
  const work = [...flagships.map((f) => f.slug), ...workIndex.map((w) => w.slug)];
  const posts = await allPosts();
  return [
    ...pair("/", 1),
    ...work.flatMap((slug, i) => pair(`/${slug}`, Math.max(0.5, 0.9 - i * 0.03))),
    ...pair("/work", 0.9),
    ...pair("/services", 0.9),
    ...pair("/pricing", 0.8),
    ...pair("/research", 0.7),
    ...pair("/studio", 0.6),
    ...pair("/contact", 0.6),
    ...pair("/tech-lead", 0.7),
    ...pair("/technical-founder", 0.7),
    ...pair("/blog", 0.6),
    ...posts.map((post) => ({ url: `${SITE}/blog/${post.slug}`, lastModified: post.updated ?? post.date, priority: 0.6 })),
  ];
}
