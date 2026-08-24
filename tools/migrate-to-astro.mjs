import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagesDir = path.join(root, "src", "pages");
const publicDir = path.join(root, "public");

const topLevelPages = readdirSync(root)
  .filter((name) => name.endsWith(".html"))
  .filter((name) => !name.startsWith("."));

const nestedPages = ["decks/tvrtko-agents.html"];
const allPages = [...topLevelPages, ...nestedPages].filter((page) => existsSync(path.join(root, page)));

const routeMap = new Map();
for (const page of allPages) {
  const parsed = path.parse(page);
  const route = parsed.name === "index" ? "/" : `/${path.join(parsed.dir, parsed.name)}`.replaceAll(path.sep, "/");
  routeMap.set(page, route);
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

function extensionlessHref(value) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace(/https:\/\/www\.lumiverse\.hr\/([^"?#]+)\.html/g, (_match, slug) => {
      return slug === "index" ? "https://www.lumiverse.hr/" : `https://www.lumiverse.hr/${slug}`;
    });
  }

  const match = value.match(/^([^?#]+)\.html([?#].*)?$/);
  if (!match) return value;

  const slug = match[1];
  const suffix = match[2] ?? "";
  if (slug === "index") {
    if (suffix.startsWith("#")) return `/${suffix}`;
    if (suffix.startsWith("?")) return `/${suffix}`;
    return "/";
  }
  return `/${slug}${suffix}`;
}

function normalizeHtml(html) {
  let next = html;

  next = next.replace(/(href|src|content)="([^"]+\.html(?:[?#][^"]*)?)"/g, (full, attr, value) => {
    return `${attr}="${extensionlessHref(value)}"`;
  });

  next = next.replace(/https:\/\/www\.lumiverse\.hr\/([^"'<\s?#]+)\.html/g, (_match, slug) => {
    return slug === "index" ? "https://www.lumiverse.hr/" : `https://www.lumiverse.hr/${slug}`;
  });

  next = next.replace(/"url":\s*"https:\/\/www\.lumiverse\.hr\/([^"]+)\.html"/g, (_match, slug) => {
    return `"url": "https://www.lumiverse.hr/${slug}"`;
  });

  return next;
}

resetDir(pagesDir);
resetDir(publicDir);

for (const page of allPages) {
  const from = path.join(root, page);
  const to = path.join(pagesDir, page);
  mkdirSync(path.dirname(to), { recursive: true });
  writeFileSync(to, normalizeHtml(readFileSync(from, "utf8")));
}

for (const name of [
  "assets",
  "images",
  "styles.css",
  "showcase.js",
  "titlomat-wave.js",
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

const sitemap = path.join(publicDir, "sitemap.xml");
if (existsSync(sitemap)) {
  writeFileSync(sitemap, normalizeHtml(readFileSync(sitemap, "utf8")));
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
