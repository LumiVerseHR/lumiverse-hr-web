// Blog post metadata for the parts of the build that run outside Astro.
//
// Astro renders the posts from src/content/blog and validates their
// frontmatter (src/content.config.mjs). The hand-written pages, though, are
// not Astro templates: the homepage "Latest writing" strip and the sitemap are
// filled in by the migrate step, before Astro runs. This reads the same
// frontmatter for them. test:seo then checks the two agree — every built post
// must be in the sitemap, and nothing else may be.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export const blogLocales = ["en", "hr"];

export function postRoute(lang, slug) {
  return lang === "en" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
}

export function blogIndexRoute(lang) {
  return lang === "en" ? "/blog" : `/${lang}/blog`;
}

function split(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: no frontmatter`);
  return { data: yaml.load(match[1]), body: match[2] };
}

// Words over a steady 220 wpm, with code blocks counted as text. Rounded up,
// so nothing reads as "0 min".
export function readingMinutes(body) {
  const words = body.replace(/<[^>]+>/g, " ").match(/[\p{L}\p{N}'’-]+/gu) ?? [];
  return Math.max(1, Math.ceil(words.length / 220));
}

const dateLocales = { en: "en-GB", hr: "hr-HR" };
export function formatDate(date, lang) {
  return new Intl.DateTimeFormat(dateLocales[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

// Posts in every locale, newest first. Drafts are left out: they render
// nowhere and must not leak into the sitemap or the homepage.
export function readPosts(root = process.cwd()) {
  const posts = [];
  for (const lang of blogLocales) {
    const dir = path.join(root, "src", "content", "blog", lang);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".md")) continue;
      const file = path.join(dir, name);
      const { data, body } = split(readFileSync(file, "utf8"), file);
      if (data.draft) continue;
      const slug = name.replace(/\.md$/, "");
      posts.push({
        lang,
        slug,
        route: postRoute(lang, slug),
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        updated: data.updated ? new Date(data.updated) : null,
        tags: data.tags ?? [],
        minutes: readingMinutes(body)
      });
    }
  }
  return posts.sort((a, b) => b.date - a.date);
}

export const isoDate = (date) => date.toISOString().slice(0, 10);
