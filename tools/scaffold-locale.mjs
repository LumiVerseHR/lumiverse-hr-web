// Create the locale copy of an English page, with the mechanical parts already
// correct: locale meta, canonical/og:url, structured-data URLs, and the
// root-absolute paths a page one directory down needs.
//
//   node tools/scaffold-locale.mjs hr rentalica.html
//   node tools/scaffold-locale.mjs hr            # every page without a copy yet
//
// The text is left in English on purpose — translating it is the human step.
// Existing files are never overwritten, so re-running this cannot clobber a
// finished translation. Run scripts/sync_shared.py afterwards to swap the
// shared nav/footer for the locale's own.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://www.lumiverse.hr";

const [locale, ...requested] = process.argv.slice(2);
if (!locale) {
  console.error("usage: node tools/scaffold-locale.mjs <locale> [page.html ...]");
  process.exit(2);
}

// Pages with no counterpart in another language: an internal design reference
// and a standalone deck.
const skip = new Set(["brand-guide.html"]);

const pages = (requested.length ? requested : readdirSync(root).filter((n) => n.endsWith(".html")))
  .filter((name) => !skip.has(name))
  .filter((name) => existsSync(path.join(root, name)));

const localeUrl = (slug) => (slug === "index" ? `${site}/${locale}/` : `${site}/${locale}/${slug}`);
const localePath = (slug) => (slug === "index" ? `/${locale}/` : `/${locale}/${slug}`);

const assetPrefixes = ["/", "#", "http://", "https://", "mailto:", "tel:", "data:"];

function rewriteUrlAttributes(html) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (full, attr, value) => {
    if (!value) return full;
    if (value === "/") return `${attr}="/${locale}/"`;
    if (assetPrefixes.some((prefix) => value.startsWith(prefix))) return full;

    const page = value.match(/^([^?#]+)\.html(#.*)?$/);
    if (page) return `${attr}="${localePath(page[1])}${page[2] ?? ""}"`;

    // Anything else is an asset that lives at the site root.
    return `${attr}="/${value}"`;
  });
}

// A page URL inside structured data, moved under the locale. Asset URLs
// (anything with a non-.html extension) are left alone.
function localeJsonUrl(url) {
  const rest = url.slice(site.length) || "/";
  if (/\.(?!html$)[a-z0-9]+$/i.test(rest.split(/[?#]/)[0])) return url;
  if (rest === "/") return `${site}/${locale}/`;
  const [, pathPart, suffix] = rest.match(/^([^?#]*)(.*)$/);
  return `${site}/${locale}${pathPart.replace(/\.html$/, "")}${suffix}`;
}

let created = 0;
for (const name of pages) {
  const target = path.join(root, locale, name);
  if (existsSync(target)) continue;

  const slug = path.basename(name, ".html");
  let html = readFileSync(path.join(root, name), "utf8");

  html = html.replace('<html lang="en">', `<html lang="${locale}">`);
  html = rewriteUrlAttributes(html);

  html = html.replace(
    /<link rel="canonical" href="[^"]+">/,
    `<link rel="canonical" href="${localeUrl(slug)}">`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]+">/,
    `<meta property="og:url" content="${localeUrl(slug)}">`
  );
  html = html.replace('<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="hr_HR">');
  html = html.replace(
    '<meta property="og:locale:alternate" content="hr_HR">',
    '<meta property="og:locale:alternate" content="en_US">'
  );

  // Structured data: page URLs move under the locale. Entity @ids do not —
  // the company and the site are the same thing in either language — and
  // neither do asset URLs, which are served from the root for both trees.
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, (block) =>
    block.replace(/"([^"]+)":\s*"(https:\/\/www\.lumiverse\.hr[^"]*)"/g, (full, key, url) =>
      key === "@id" ? full : full.replace(url, localeJsonUrl(url))
    )
  );

  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, html);
  created += 1;
}

console.log(
  created
    ? `Scaffolded ${created} ${locale} page(s). Translate the copy, then run scripts/sync_shared.py.`
    : `Nothing to scaffold — every ${locale} page already exists.`
);
