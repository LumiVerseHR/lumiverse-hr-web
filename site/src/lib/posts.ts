import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { marked } from "marked";

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
};

const DIR = path.join(process.cwd(), "content", "blog", "en");

function split(source: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) return null;
  return { data: (yaml.load(match[1]) ?? {}) as Record<string, unknown>, body: match[2] };
}

// Words over a steady 220 wpm, code counted as text, rounded up (as the legacy build did).
const readingMinutes = (body: string) => Math.max(1, Math.ceil((body.replace(/<[^>]+>/g, " ").match(/[\p{L}\p{N}'’-]+/gu) ?? []).length / 220));

const isoDay = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? ""));

async function load(file: string) {
  const parsed = split(await readFile(path.join(DIR, file), "utf8"));
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
  };
  return { meta, body: parsed.body };
}

// Posts change only with a deploy, so listings and pages are cached with the build.
export async function allPosts(): Promise<PostMeta[]> {
  "use cache";
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(files.map(load));
  return posts
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => p.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function latestPosts(count: number): Promise<PostMeta[]> {
  "use cache";
  return (await allPosts()).slice(0, count);
}

export async function getPost(slug: string): Promise<{ meta: PostMeta; html: string } | null> {
  "use cache";
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const post = await load(`${slug}.md`);
    if (!post) return null;
    const html = (await marked.parse(post.body, { gfm: true })).replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
    return { meta: post.meta, html };
  } catch {
    return null;
  }
}
