import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcPages = path.join(root, "src", "pages");
const dist = path.join(root, "dist");

const pages = [];
function walk(dir, base = "") {
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    const rel = path.join(base, name);
    if (statSync(file).isDirectory()) walk(file, rel);
    else if (name.endsWith(".html")) pages.push(rel);
  }
}

function normalize(html) {
  return html
    .replace(/<meta name="generator" content="Astro v[^"]+">/g, "")
    .replace(/\s+$/gm, "")
    .trim();
}

walk(srcPages);

const failures = [];
for (const page of pages) {
  const src = path.join(srcPages, page);
  const built = path.join(dist, page);
  if (!existsSync(built)) {
    failures.push(`${page}: missing built output`);
    continue;
  }

  const sourceHtml = normalize(readFileSync(src, "utf8"));
  const builtHtml = normalize(readFileSync(built, "utf8"));
  if (sourceHtml !== builtHtml) {
    failures.push(`${page}: built HTML differs from migrated source`);
  }
}

// css/js go out with `immutable`, so a URL must never change contents. Every
// reference has to carry a content hash and resolve — an unversioned styles.css
// looks fine on a cold browser and silently serves stale CSS to everyone else.
const versioned = /^\/[^"]+\.[0-9a-f]{8}\.(?:css|js|mjs)$/;
for (const page of pages) {
  const built = path.join(dist, page);
  if (!existsSync(built)) continue;
  const html = readFileSync(built, "utf8");
  for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"]+\.(?:css|js|mjs))"/g)) {
    if (!versioned.test(url)) failures.push(`${page}: ${url} is not content-hashed`);
    else if (!existsSync(path.join(dist, url.slice(1)))) failures.push(`${page}: ${url} does not exist`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Parity passed for ${pages.length} built HTML page(s), assets content-hashed.`);
