import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/i18n/config";
import type { CaseStudy } from "@/content/case-schema";

const DIR = path.join(process.cwd(), "content", "cases");

// Case studies change only with a deploy, so they are read once and cached with the build.
export async function caseSlugs(): Promise<string[]> {
  "use cache";
  return (await readdir(DIR)).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
}

export async function getCase(slug: string, lang: Locale): Promise<CaseStudy | null> {
  "use cache";
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const all = JSON.parse(await readFile(path.join(DIR, `${slug}.json`), "utf8")) as Record<Locale, CaseStudy>;
    return all[lang] ?? null;
  } catch {
    return null;
  }
}
