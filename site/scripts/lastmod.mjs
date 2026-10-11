// Writes src/content/lastmod.json: for each sitemap path, the date of the last commit that
// touched what the page is built from. The production image has no .git, so the dates are
// computed here and committed. Run before a deploy:  npm run lastmod
import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const { packaged } = await import(path.join(ROOT, "src/content/packages.mjs"));

const day = (paths) =>
  execFileSync("git", ["log", "-1", "--format=%cs", "--", ...paths], { cwd: ROOT, encoding: "utf8" }).trim() || undefined;

const app = (p) => `src/app/[lang]${p}`;
const PACKAGES = ["src/content/packages.mjs", "src/content/pricing-i18n.mjs", "src/components/packages", "public/packages"];

const sources = {
  "/": [app("/page.tsx"), "src/components/hero", "src/components/effects", "src/components/sections", "src/i18n/dictionaries", "public/hero"],
  "/work": [app("/work"), "src/content/work.ts", "content/cases"],
  "/services": [app("/services"), "src/components/sections/Services.tsx", "src/content/packages.mjs"],
  "/packages": [app("/packages/page.tsx"), ...PACKAGES],
  "/pricing": [app("/pricing"), "src/components/pricing", "src/content/packages.mjs", "src/content/pricing-i18n.mjs"],
  "/research": [app("/research"), "src/components/page/ResearchExplainer.tsx", "content/cases/air-laser.json"],
  "/studio": [app("/studio"), "src/components/sections/Studio.tsx"],
  "/contact": [app("/contact"), "src/components/sections/Contact.tsx", "src/components/sections/ContactForm.tsx"],
  "/tech-lead": [app("/tech-lead"), "src/content/landing.ts", "src/components/landing"],
  "/technical-founder": [app("/technical-founder"), "src/content/landing.ts", "src/components/landing"],
  "/blog": [app("/blog/page.tsx"), "content/blog"],
};
for (const pkg of packaged) sources[`/packages/${pkg.id}`] = [app("/packages/[id]"), ...PACKAGES];
for (const file of readdirSync(path.join(ROOT, "content/cases"))) {
  sources[`/${file.replace(/\.json$/, "")}`] = [`content/cases/${file}`, "src/components/case"];
}

const out = {};
for (const [route, paths] of Object.entries(sources)) out[route] = day(paths);
// Posts per language: the English text and each translation change on their own.
for (const lang of readdirSync(path.join(ROOT, "content/blog"))) {
  for (const file of readdirSync(path.join(ROOT, "content/blog", lang))) {
    out[`${lang}:/blog/${file.replace(/\.md$/, "")}`] = day([`content/blog/${lang}/${file}`]);
  }
}
writeFileSync(path.join(ROOT, "src/content/lastmod.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`${Object.keys(out).length} dates in src/content/lastmod.json`);
