import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { marked } from "marked";
import { locales, type Locale } from "@/i18n/config";

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  related: string[];
  image?: string;
  minutes: number;
  // The language the text is written in; an English post may stand in on the Croatian blog.
  lang: Locale;
  // Every language this post is written in, for hreflang and the language switch.
  langs: Locale[];
};

// Posts are written in English first (content/blog/en); a translation sits under the same
// file name in content/blog/<lang>.
const dirOf = (lang: Locale) => path.join(process.cwd(), "content", "blog", lang);

async function filesIn(lang: Locale) {
  try {
    return new Set((await readdir(dirOf(lang))).filter((f) => f.endsWith(".md")));
  } catch {
    return new Set<string>();
  }
}

function split(source: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) return null;
  return { data: (yaml.load(match[1]) ?? {}) as Record<string, unknown>, body: match[2] };
}

// Words over a steady 220 wpm, code counted as text, rounded up (as the legacy build did).
const readingMinutes = (body: string) => Math.max(1, Math.ceil((body.replace(/<[^>]+>/g, " ").match(/[\p{L}\p{N}'’-]+/gu) ?? []).length / 220));

const isoDay = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? ""));

async function load(file: string, lang: Locale, langs: Locale[]) {
  const parsed = split(await readFile(path.join(dirOf(lang), file), "utf8"));
  if (!parsed || parsed.data.draft) return null;
  const d = parsed.data;
  const meta: PostMeta = {
    slug: file.replace(/\.md$/, ""),
    title: String(d.title),
    description: String(d.description),
    date: isoDay(d.date),
    updated: d.updated ? isoDay(d.updated) : undefined,
    tags: (d.tags as string[]) ?? [],
    related: (d.related as string[]) ?? [],
    image: d.image ? String(d.image).replace("/images/og/", "/og/") : undefined,
    minutes: readingMinutes(parsed.body),
    lang,
    langs,
  };
  return { meta, body: parsed.body };
}

// Each post once, in `lang` where it's translated and in English where it isn't yet.
async function sources(lang: Locale) {
  const sets = await Promise.all(locales.map(async (l) => [l, await filesIn(l)] as const));
  const has = new Map(sets);
  return [...has.get("en")!].map((file) => ({
    file,
    lang: has.get(lang)!.has(file) ? lang : ("en" as Locale),
    langs: locales.filter((l) => has.get(l)!.has(file)) as Locale[],
  }));
}

// Posts change only with a deploy, so listings and pages are cached with the build.
export async function allPosts(lang: Locale = "en"): Promise<PostMeta[]> {
  "use cache";
  const posts = await Promise.all((await sources(lang)).map((src) => load(src.file, src.lang, src.langs)));
  return posts
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => p.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function latestPosts(count: number, lang: Locale = "en"): Promise<PostMeta[]> {
  "use cache";
  return (await allPosts(lang)).slice(0, count);
}

// A post in `lang` only: an untranslated post has no Croatian page, the listing links to English.
export async function getPost(slug: string, lang: Locale = "en"): Promise<{ meta: PostMeta; html: string } | null> {
  "use cache";
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const file = `${slug}.md`;
  const src = (await sources(lang)).find((s) => s.file === file);
  if (!src || src.lang !== lang) return null;
  try {
    const post = await load(file, lang, src.langs);
    if (!post) return null;
    const html = (await marked.parse(post.body, { gfm: true })).replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
    return { meta: post.meta, html };
  } catch {
    return null;
  }
}
