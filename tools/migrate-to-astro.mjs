import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assetVersions } from "./asset-version.mjs";
import { latestStrip, sitemapEntries } from "./blog-embed.mjs";
import { pricingSitemapEntries, pricingStrip } from "./pricing-embed.mjs";
import { updated as pricingUpdated } from "../src/pricing/packages.mjs";

const root = process.cwd();
const pagesDir = path.join(root, "src", "pages");
const publicDir = path.join(root, "public");

function htmlPagesIn(dir) {
  const from = path.join(root, dir);
  if (!existsSync(from)) return [];
  return readdirSync(from)
    .filter((name) => name.endsWith(".html"))
    .filter((name) => !name.startsWith("."))
    .map((name) => (dir ? `${dir}/${name}` : name));
}

// English pages live at the repo root; each translation gets its own directory
// (hr/ -> /hr/...). Add a locale here to pick up a new language tree.
const localeDirs = ["hr"];

const topLevelPages = htmlPagesIn("");
const localePages = localeDirs.flatMap((dir) => htmlPagesIn(dir));
// Unlisted pages: noindex, not in the sitemap, linked from nowhere.
const nestedPages = ["decks/tvrtko-agents.html", "v/reel-38bf03.html"];
const allPages = [...topLevelPages, ...localePages, ...nestedPages].filter((page) =>
  existsSync(path.join(root, page))
);

const assetVersionMap = assetVersions(root);

function versionAssetRefs(html) {
  let next = html;
  for (const [name, versioned] of assetVersionMap) {
    // Both trees end up absolute: the Croatian pages sit one directory down.
    next = next.replaceAll(`="${name}"`, `="/${versioned}"`).replaceAll(`="/${name}"`, `="/${versioned}"`);
  }
  return next;
}

function resetDir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function copyIfExists(name) {
  const from = path.join(root, name);
  if (!existsSync(from)) return;
  const to = path.join(publicDir, name);
  mkdirSync(path.dirname(to), { recursive: true });
  cpSync(from, to, {
    recursive: true,
    filter: (source) => path.basename(source) !== ".DS_Store"
  });
}

function extensionlessPath(slug) {
  if (slug === "index") return "/";
  if (slug.endsWith("/index")) return `/${slug.slice(0, -"index".length)}`;
  return `/${slug}`;
}

function extensionlessHref(value) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace(/https:\/\/www\.lumiverse\.hr\/([^"?#]+)\.html/g, (_match, slug) => {
      return `https://www.lumiverse.hr${extensionlessPath(slug)}`;
    });
  }

  const match = value.match(/^([^?#]+)\.html([?#].*)?$/);
  if (!match) return value;

  const slug = match[1];
  const suffix = match[2] ?? "";
  // index.html -> /, hr/index.html -> /hr/
  if (slug === "index" || slug.endsWith("/index")) {
    const base = slug === "index" ? "/" : `/${slug.slice(0, -"index".length)}`;
    return `${base}${suffix}`;
  }
  return `/${slug}${suffix}`;
}

function normalizeHtml(html) {
  let next = html;

  next = next.replace(/(href|src|content)="([^"]+\.html(?:[?#][^"]*)?)"/g, (full, attr, value) => {
    return `${attr}="${extensionlessHref(value)}"`;
  });

  next = next.replace(/https:\/\/www\.lumiverse\.hr\/([^"'<\s?#]+)\.html/g, (_match, slug) => {
    return `https://www.lumiverse.hr${extensionlessPath(slug)}`;
  });

  next = next.replace(/"url":\s*"https:\/\/www\.lumiverse\.hr\/([^"]+)\.html"/g, (_match, slug) => {
    return `"url": "https://www.lumiverse.hr/${slug}"`;
  });

  next = versionAssetRefs(next);

  return next;
}

resetDir(pagesDir);
resetDir(publicDir);

for (const page of allPages) {
  const from = path.join(root, page);
  const to = path.join(pagesDir, page);
  mkdirSync(path.dirname(to), { recursive: true });
  writeFileSync(to, pricingStrip(page, latestStrip(page, normalizeHtml(readFileSync(from, "utf8")))));
}

for (const name of [
  "assets",
  "images",
  "styles.css",
  "showcase.js",
  "titlomat-wave.js",
  "consent.js",
  "contact.js",
  "favicon.ico",
  "favicon.svg",
  "favicon-192.png",
  "favicon-512.png",
  "apple-touch-icon.png",
  "manifest.json",
  "robots.txt",
  "humans.txt",
  "security.txt",
  "sitemap.xml",
  "9a989dede381f46ba9e5cd01bc2f05be.txt",
  "a896216ec977489e82d87fa78ee95089.txt",
  "LumiVerse-white.png"
]) {
  copyIfExists(name);
}

for (const [name, versioned] of assetVersionMap) {
  writeFileSync(path.join(publicDir, versioned), readFileSync(path.join(root, name)));
  rmSync(path.join(publicDir, name), { force: true });
}

const sitemap = path.join(publicDir, "sitemap.xml");
if (existsSync(sitemap)) {
  writeFileSync(sitemap, pricingSitemapEntries(sitemapEntries(normalizeHtml(readFileSync(sitemap, "utf8"))), pricingUpdated));
}

const manifest = path.join(publicDir, "manifest.json");
if (existsSync(manifest)) {
  const data = JSON.parse(readFileSync(manifest, "utf8"));
  if (data.start_url === "index.html") data.start_url = "/";
  writeFileSync(manifest, `${JSON.stringify(data, null, 2)}\n`);
}

const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else files.push(file);
  }
}
walk(pagesDir);
walk(publicDir);

console.log(`Migrated ${allPages.length} page(s) and ${files.length - allPages.length} public file(s).`);
