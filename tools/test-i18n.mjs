// Structural checks for the two language trees in dist/.
//
// The copy itself is reviewed by hand; this guards the mechanical parts that
// are easy to get wrong and invisible until a crawler or a phone finds them:
// missing counterparts, wrong canonicals, non-reciprocal hreflang, and the
// relative asset paths that would 404 one directory down under /hr/.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

  // One switcher, in the nav bar. It lives there rather than in the mobile
  // overlay because the bar outranks the overlay (z-index 1000 vs 999) and so
  // stays reachable at every width, menu open or shut.
  const switcherLinks = [...html.matchAll(/<a href="([^"]+)" hreflang="([^"]+)"[^>]*>/g)]
    .filter(([, , hreflang]) => hreflang === altLang)
    .map(([, href]) => href);
  if (switcherLinks.length !== 1) {
    fail(file, `expected 1 language-switcher link to "${altLang}", found ${switcherLinks.length}`);
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

// A locale can override any shared image by dropping images/<locale>/<name>
// next to it — that is how the Croatian tree gets Croatian product screenshots.
// The override only helps if the file is actually there, so every referenced
// image must resolve, in both trees.
function everyPage(dir, base = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = `${dir}/${name}`;
    if (statSync(full).isDirectory()) out.push(...everyPage(full, `${base}${name}/`));
    else if (name.endsWith(".html")) out.push(`${base}${name}`);
  }
  return out;
}
for (const file of everyPage(dist)) {
  const html = readFileSync(`${dist}/${file}`, "utf8");
  for (const [, src] of html.matchAll(/<img[^>]+src="(\/images\/[^"]+)"/g)) {
    if (!existsSync(path.join(dist, src))) fail(file, `image not found: ${src}`);
  }
}

// Structured-data breadcrumbs are what a search result renders, so they have
// to match the visible breadcrumb rather than stay in the source language.
const englishCrumbs = ["Home", "Work", "Research"];
for (const [, hrFile] of pairs) {
  const html = read(hrFile);
  if (!html) continue;
  for (const crumb of englishCrumbs) {
    if (html.includes(`"name": "${crumb}"`)) {
      fail(hrFile, `structured-data breadcrumb still reads "${crumb}"`);
    }
  }
}

// Our own products default to Croatian at their root and expose the English
// version at /en, so each tree has to link the matching one. Verified live:
// titlomat.com/ is lang="hr", mojkolega.hr/ redirects to /hr, mojkraj.hr/ is
// Croatian. Products with no second language (tvrtko.ai, theaimito.com) are
// deliberately absent from this list.
const bilingualProducts = ["titlomat.com", "mojkraj.hr", "mojkolega.hr"];
for (const [enFile, hrFile] of pairs.map(([a, b]) => [a, b])) {
  for (const [file, wantEnglish] of [[enFile, true], [hrFile, false]]) {
    const html = read(file);
    if (!html) continue;
    for (const host of bilingualProducts) {
      const bare = new RegExp(`href="https://${host.replace(".", "\\.")}/?"`, "g");
      const english = new RegExp(`href="https://${host.replace(".", "\\.")}/en"`, "g");
      const bareCount = (html.match(bare) ?? []).length;
      const enCount = (html.match(english) ?? []).length;
      if (wantEnglish && bareCount) {
        fail(file, `links ${host} without /en — English readers would land on the Croatian site`);
      }
      if (!wantEnglish && enCount) {
        fail(file, `links ${host}/en from the Croatian tree`);
      }
    }
  }
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
