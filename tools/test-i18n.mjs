// Structural checks for the two language trees in dist/.
//
// The copy itself is reviewed by hand; this guards the mechanical parts that
// are easy to get wrong and invisible until a crawler or a phone finds them:
// missing counterparts, wrong canonicals, non-reciprocal hreflang, and the
// relative asset paths that would 404 one directory down under /hr/.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const site = "https://www.lumiverse.hr";

const slugs = [
  "titlomat",
  "air-laser",
  "moj-kolega",
  "bridj",
  "barcoder",
  "aimito",
  "rentalica",
  "mojkraj",
  "overserved",
  "tvrtko",
  "country-guides",
  "army-adria",
  "pitaj-lider",
  "lider-pdf-archive",
  "lider-translations"
];

// [english file, croatian file, english route, croatian route]
const pairs = [
  ["index.html", "hr/index.html", "/", "/hr/"],
  ...slugs.map((slug) => [`${slug}.html`, `hr/${slug}.html`, `/${slug}`, `/hr/${slug}`])
];

const failures = [];
const fail = (file, message) => failures.push(`${file}: ${message}`);

function read(file) {
  const full = path.join(dist, file);
  if (!existsSync(full)) return null;
  return readFileSync(full, "utf8");
}

function attr(html, re) {
  const match = html.match(re);
  return match ? match[1] : null;
}

function alternates(html) {
  const found = {};
  const re = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g;
  let match;
  while ((match = re.exec(html))) found[match[1]] = match[2];
  return found;
}

function checkPage(file, html, { lang, route, altRoute, altLang, ogLocale, altOgLocale }) {
  const htmlLang = attr(html, /<html lang="([^"]+)"/);
  if (htmlLang !== lang) fail(file, `<html lang> is "${htmlLang}", expected "${lang}"`);

  const canonical = attr(html, /<link rel="canonical" href="([^"]+)">/);
  if (canonical !== `${site}${route}`) {
    fail(file, `canonical is "${canonical}", expected "${site}${route}"`);
  }

  const alts = alternates(html);
  const want = {
    en: `${site}${lang === "en" ? route : altRoute}`,
    hr: `${site}${lang === "hr" ? route : altRoute}`,
    "x-default": `${site}${lang === "en" ? route : altRoute}`
  };
  for (const [key, value] of Object.entries(want)) {
    if (alts[key] !== value) {
      fail(file, `hreflang="${key}" is "${alts[key] ?? "missing"}", expected "${value}"`);
    }
  }

  const locale = attr(html, /<meta property="og:locale" content="([^"]+)">/);
  if (locale !== ogLocale) fail(file, `og:locale is "${locale}", expected "${ogLocale}"`);

  const altLocale = attr(html, /<meta property="og:locale:alternate" content="([^"]+)">/);
  if (altLocale !== altOgLocale) {
    fail(file, `og:locale:alternate is "${altLocale}", expected "${altOgLocale}"`);
  }

  const ogUrl = attr(html, /<meta property="og:url" content="([^"]+)">/);
  if (ogUrl !== `${site}${route}`) fail(file, `og:url is "${ogUrl}", expected "${site}${route}"`);

  // The language switcher must link to this page's counterpart, in the desktop
  // nav and in the mobile overlay.
  const switcherLinks = [...html.matchAll(/<a href="([^"]+)" hreflang="([^"]+)"[^>]*>/g)]
    .filter(([, , hreflang]) => hreflang === altLang)
    .map(([, href]) => href);
  if (switcherLinks.length !== 2) {
    fail(file, `expected 2 language-switcher links to "${altLang}", found ${switcherLinks.length}`);
  }
  for (const href of switcherLinks) {
    if (href !== altRoute) fail(file, `language switcher points at "${href}", expected "${altRoute}"`);
  }
}

// Relative URLs resolve against /hr/ and would 404; Croatian pages must use
// root-absolute paths for every asset and internal link.
const allowedPrefixes = ["/", "http://", "https://", "#", "mailto:", "tel:", "data:"];
function checkAbsolutePaths(file, html) {
  const re = /\b(?:href|src)="([^"]*)"/g;
  let match;
  const bad = new Set();
  while ((match = re.exec(html))) {
    const value = match[1];
    if (!value) continue;
    if (allowedPrefixes.some((prefix) => value.startsWith(prefix))) continue;
    bad.add(value);
  }
  if (bad.size) {
    fail(file, `relative URL(s) would break under /hr/: ${[...bad].join(", ")}`);
  }
}

for (const [enFile, hrFile, enRoute, hrRoute] of pairs) {
  const en = read(enFile);
  const hr = read(hrFile);

  if (!en) {
    fail(enFile, "missing English page");
    continue;
  }
  if (!hr) {
    fail(hrFile, "missing Croatian counterpart");
    continue;
  }

  checkPage(enFile, en, {
    lang: "en",
    route: enRoute,
    altRoute: hrRoute,
    altLang: "hr",
    ogLocale: "en_US",
    altOgLocale: "hr_HR"
  });

  checkPage(hrFile, hr, {
    lang: "hr",
    route: hrRoute,
    altRoute: enRoute,
    altLang: "en",
    ogLocale: "hr_HR",
    altOgLocale: "en_US"
  });

  checkAbsolutePaths(hrFile, hr);
}

// The Croatian error page is served by nginx under the /hr/ prefix.
const hr404 = read("hr/404.html");
if (!hr404) fail("hr/404.html", "missing Croatian error page");
else {
  if (attr(hr404, /<html lang="([^"]+)"/) !== "hr") fail("hr/404.html", '<html lang> is not "hr"');
  if (!/<meta name="robots" content="noindex/.test(hr404)) fail("hr/404.html", "missing noindex");
  checkAbsolutePaths("hr/404.html", hr404);
}

// Every Croatian route belongs in the sitemap.
const sitemap = read("sitemap.xml");
if (!sitemap) fail("sitemap.xml", "missing from build output");
else {
  for (const [, , , hrRoute] of pairs) {
    if (!sitemap.includes(`<loc>${site}${hrRoute}</loc>`)) {
      fail("sitemap.xml", `missing <loc> for ${hrRoute}`);
    }
  }
}

if (failures.length) {
  console.error(`i18n checks failed:\n${failures.map((line) => `  - ${line}`).join("\n")}`);
  process.exit(1);
}

console.log(`i18n checks passed for ${pairs.length} page pair(s), the Croatian 404 and the sitemap.`);
