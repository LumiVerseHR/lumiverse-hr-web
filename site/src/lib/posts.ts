import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type PostMeta = { slug: string; title: string; description: string; date: string; minutes: number };

const DIR = path.join(process.cwd(), "content", "blog", "en");

// Front matter is flat `key: value` lines; that is all the homepage strip needs.
function parse(source: string) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source);
  if (!match) return null;
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: match[2] };
}

// Posts change only with a deploy, so the listing is cached with the build.
export async function latestPosts(count: number): Promise<PostMeta[]> {
  "use cache";
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const parsed = parse(await readFile(path.join(DIR, file), "utf8"));
      if (!parsed) return null;
      const words = parsed.body.split(/\s+/).filter(Boolean).length;
      return {
        slug: file.replace(/\.md$/, ""),
        title: parsed.meta.title,
        description: parsed.meta.description,
        date: parsed.meta.date,
        minutes: Math.max(1, Math.round(words / 220)),
      } satisfies PostMeta;
    }),
  );
  return posts
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}
