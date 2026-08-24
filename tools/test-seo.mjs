// On-page SEO checks over the built site.
//
// These are the things that are invisible until a search result renders badly:
// a title that truncates, two pages competing on the same description, a page
// that is indexable but missing from the sitemap (or in it while noindex).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const site = "https://www.lumiverse.hr";

// Google truncates around 60 characters of title and 160 of description; the
// lower bounds catch a tag that was left as a stub.
const TITLE = { min: 30, max: 65 };
const DESCRIPTION = { min: 110, max: 165 };

const failures = [];
const fail = (file, message) => failures.push(`${file}: ${message}`);

function walk(dir, base = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, `${base}${name}/`));
    else if (name.endsWith(".html")) out.push(`${base}${name}`);
  }
  return out;
}

// Length is what the SERP renders, so entities count as one character.
function decode(value) {
  return value
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&middot;/g, "·").replace(/&times;/g, "×").replace(/&mdash;/g, "—");
}

const attr = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1].trim()) : null;
};

const sitemap = readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const inSitemap = (route) => sitemap.includes(`<loc>${site}${route}</loc>`);

const routeOf = (file) =>
  file === "index.html" ? "/" : file === "hr/index.html" ? "/hr/" : `/${file.replace(/\.html$/, "")}`;

const pages = walk(dist);
const seenTitle = new Map();
const seenDescription = new Map();

for (const file of pages) {
  const html = readFileSync(path.join(dist, file), "utf8");
  const robots = attr(html, /<meta name="robots" content="([^"]+)">/) ?? "";
  const indexable = !/noindex/i.test(robots);
  const route = routeOf(file);

  // A page is either meant for search — and then it needs the tags and a
  // sitemap entry — or it is not, and then it must stay out of the sitemap.
  if (!indexable) {
    if (inSitemap(route)) fail(file, `noindex but listed in sitemap.xml`);
    continue;
  }
  if (!inSitemap(route)) fail(file, `indexable but missing from sitemap.xml (add it, or mark it noindex)`);

  const title = attr(html, /<title>([^<]*)<\/title>/);
  if (!title) fail(file, "no <title>");
  else {
    if (title.length < TITLE.min || title.length > TITLE.max) {
      fail(file, `title is ${title.length} chars, want ${TITLE.min}-${TITLE.max}: ${JSON.stringify(title)}`);
    }
    const twin = seenTitle.get(title);
    if (twin) fail(file, `title duplicates ${twin}`);
    else seenTitle.set(title, file);
  }

  const description = attr(html, /<meta name="description" content="([^"]*)">/);
  if (!description) fail(file, "no meta description");
  else {
    if (description.length < DESCRIPTION.min || description.length > DESCRIPTION.max) {
      fail(file, `description is ${description.length} chars, want ${DESCRIPTION.min}-${DESCRIPTION.max}`);
    }
    const twin = seenDescription.get(description);
    if (twin) fail(file, `meta description duplicates ${twin}`);
    else seenDescription.set(description, file);
  }

  // Social tags restate the same two strings; drift means a shared link and a
  // search result describe the page differently.
  for (const [label, re, want] of [
    ["og:title", /<meta property="og:title" content="([^"]*)">/, title],
    ["twitter:title", /<meta name="twitter:title" content="([^"]*)">/, title],
    ["og:description", /<meta property="og:description" content="([^"]*)">/, description],
    ["twitter:description", /<meta name="twitter:description" content="([^"]*)">/, description],
  ]) {
    const got = attr(html, re);
    if (got === null) fail(file, `missing ${label}`);
    else if (want && got !== want) fail(file, `${label} differs from the page's own ${label.split(":")[1]}`);
  }

  const image = attr(html, /<meta property="og:image" content="([^"]*)">/);
  if (!image) fail(file, "no og:image");
  else if (image.startsWith(site) && !existsSync(path.join(dist, image.slice(site.length)))) {
    fail(file, `og:image does not resolve: ${image}`);
  }

  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ");
  const h1 = body.match(/<h1[\s>]/gi) ?? [];
  if (h1.length !== 1) fail(file, `${h1.length} <h1> elements, want exactly 1`);

  for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block);
    } catch (error) {
      fail(file, `malformed JSON-LD: ${error.message}`);
    }
  }
}

if (failures.length) {
  console.error(`SEO checks failed:\n${failures.map((line) => `  - ${line}`).join("\n")}`);
  process.exit(1);
}
console.log(`SEO checks passed for ${pages.length} built page(s).`);
