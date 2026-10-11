import type { MetadataRoute } from "next";
import { packaged } from "@/content/packages.mjs";
import { flagships, workIndex } from "@/content/work";
import lastmod from "@/content/lastmod.json";
import { localePath } from "@/i18n/config";
import { allPosts } from "@/lib/posts";

const SITE = "https://www.lumiverse.hr";

// Every page in both languages, each entry naming its translation (hreflang).
// Priorities follow the homepage order, as the legacy sitemap did.
// Last commit that touched each page's sources (npm run lastmod; the image has no .git).
const dates = lastmod as Record<string, string | undefined>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pair = (path: string, priority: number): MetadataRoute.Sitemap => {
    const languages = { en: `${SITE}${localePath("en", path)}`, hr: `${SITE}${localePath("hr", path)}` };
    return (["en", "hr"] as const).map((lang) => ({
      url: languages[lang],
      lastModified: dates[path],
      priority,
      changeFrequency: "monthly" as const,
      alternates: { languages },
    }));
  };
  const work = [...flagships.map((f) => f.slug), ...workIndex.map((w) => w.slug)];
  const posts = await allPosts();
  // A post's own URLs, naming the translations it has.
  const postEntries = posts.flatMap((post) => {
    const languages = Object.fromEntries(post.langs.map((l) => [l, `${SITE}${localePath(l, `/blog/${post.slug}`)}`]));
    return post.langs.map((l) => ({
      url: languages[l],
      lastModified: dates[`${l}:/blog/${post.slug}`] ?? post.updated ?? post.date,
      priority: 0.6,
      alternates: { languages },
    }));
  });
  return [
    ...pair("/", 1),
    ...work.flatMap((slug, i) => pair(`/${slug}`, Math.max(0.5, 0.9 - i * 0.03))),
    ...pair("/work", 0.9),
    ...pair("/services", 0.9),
    ...pair("/packages", 0.9),
    ...(packaged as { id: string }[]).flatMap((pkg) => pair(`/packages/${pkg.id}`, 0.7)),
    ...pair("/pricing", 0.8),
    ...pair("/research", 0.7),
    ...pair("/studio", 0.6),
    ...pair("/contact", 0.6),
    ...pair("/tech-lead", 0.7),
    ...pair("/technical-founder", 0.7),
    ...pair("/blog", 0.6),
    ...postEntries,
  ];
}
