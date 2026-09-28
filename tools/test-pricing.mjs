// Prices over the built site: every price shown is one that
// src/pricing/packages.mjs defines, and every package it defines is shown.
//
// A pricing page that disagrees with itself (a card says one number, the
// homepage another, the structured data a third) is what this guards. The
// packages file is the single source; this checks nothing drifted from it
// on the way to dist/.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { amountsOf, formatEuro, packages } from "../src/pricing/packages.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const failures = [];
const fail = (file, message) => failures.push(`${file}: ${message}`);
const read = (file) => readFileSync(path.join(dist, file), "utf8");

const langs = ["en", "hr"];
const pricingPages = { en: "pricing.html", hr: "hr/pricing.html" };
const homepages = { en: "index.html", hr: "hr/index.html" };
const formPages = [...Object.values(pricingPages), ...Object.values(homepages)];

// The source itself: unique ids, complete copy, proof that resolves.
const ids = new Set();
for (const pkg of packages) {
  if (ids.has(pkg.id)) fail("packages.mjs", `duplicate id ${pkg.id}`);
  ids.add(pkg.id);
  if (!Number.isInteger(pkg.price.from) || pkg.price.from <= 0) fail("packages.mjs", `${pkg.id}: bad price.from`);
  if (pkg.price.then !== undefined && pkg.price.per !== "setup") fail("packages.mjs", `${pkg.id}: "then" without per: "setup"`);
  if (pkg.price.fullTime !== undefined && (pkg.price.per !== "month" || pkg.price.fullTime <= pkg.price.from)) {
    fail("packages.mjs", `${pkg.id}: fullTime needs per: "month" and must exceed the part-time rate`);
  }
  if (!["once", "project", "month", "setup"].includes(pkg.price.per)) fail("packages.mjs", `${pkg.id}: unknown per "${pkg.price.per}"`);
  for (const lang of langs) {
    const c = pkg[lang];
    for (const key of ["name", "summary", "proof", "cta"]) if (!c?.[key]) fail("packages.mjs", `${pkg.id}.${lang}.${key} is empty`);
    if (!c?.includes?.length) fail("packages.mjs", `${pkg.id}.${lang}.includes is empty`);
    const page = lang === "en" ? `${pkg.proof}.html` : `hr/${pkg.proof}.html`;
    if (!existsSync(path.join(root, page))) fail("packages.mjs", `${pkg.id}: proof page ${page} does not exist`);
  }
  if (pkg.en.includes.length !== pkg.hr.includes.length) fail("packages.mjs", `${pkg.id}: en and hr list different inclusions`);
}

// Euro amounts as each language writes them: "€6,900" and "6.900 €".
const amountPattern = { en: /€\s?(\d{1,3}(?:,\d{3})*)/g, hr: /(\d{1,3}(?:\.\d{3})*)\s?€/g };
const known = new Set(packages.flatMap((pkg) => amountsOf(pkg.price)));
const visibleText = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/&euro;/g, "€")
    .replace(/&nbsp;/g, " ");

for (const lang of langs) {
  for (const file of [pricingPages[lang], homepages[lang]]) {
    if (!existsSync(path.join(dist, file))) {
      fail(file, "not built");
      continue;
    }
    const html = read(file);
    const text = visibleText(html);

    // No price on the page that the packages file doesn't define...
    for (const [, digits] of text.matchAll(amountPattern[lang])) {
      const amount = Number(digits.replace(/[.,]/g, ""));
      if (!known.has(amount)) fail(file, `shows ${digits} €, which is not a price in packages.mjs`);
    }
    // ...and every package's price where that package is listed.
    for (const pkg of packages) {
      for (const amount of amountsOf(pkg.price)) {
        if (!text.includes(formatEuro(amount, lang))) fail(file, `${pkg.id}: ${formatEuro(amount, lang)} is missing`);
      }
      if (!text.includes(pkg[lang].name.replace(/&/g, "&amp;"))) fail(file, `${pkg.id}: name "${pkg[lang].name}" is missing`);
      // A caveat on a price travels with the price, wherever it's shown.
      if (pkg[lang].priceNote && !text.includes(pkg[lang].priceNote)) fail(file, `${pkg.id}: price note is missing`);
    }
    if (html.includes("<!-- pricing:")) fail(file, "a pricing marker was left unfilled");
  }

  if (!existsSync(path.join(dist, pricingPages[lang])) || !existsSync(path.join(dist, homepages[lang]))) continue;

  // Every card on the pricing page, reachable by its id.
  const pricing = read(pricingPages[lang]);
  for (const pkg of packages) {
    if (!pricing.includes(`<article class="price-card" id="${pkg.id}">`)) fail(pricingPages[lang], `no card with id="${pkg.id}"`);
    if (!read(homepages[lang]).includes(`pricing#${pkg.id}"`)) fail(homepages[lang], `nothing links to the ${pkg.id} card`);
  }

  // Structured data quotes the same numbers.
  const blocks = [...pricing.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const catalog = blocks.find((block) => block["@type"] === "OfferCatalog");
  if (!catalog) fail(pricingPages[lang], "no OfferCatalog JSON-LD");
  else {
    if (catalog.itemListElement.length !== packages.length) fail(pricingPages[lang], "OfferCatalog does not list every package");
    for (const pkg of packages) {
      const offer = catalog.itemListElement.find((item) => item.url.endsWith(`#${pkg.id}`));
      if (!offer) {
        fail(pricingPages[lang], `OfferCatalog is missing ${pkg.id}`);
        continue;
      }
      const specs = [offer.priceSpecification].flat();
      const first = specs[0].price ?? specs[0].minPrice;
      if (first !== pkg.price.from) fail(pricingPages[lang], `${pkg.id}: JSON-LD price ${first}, packages.mjs ${pkg.price.from}`);
      if (pkg.price.then && specs[1]?.minPrice !== pkg.price.then) fail(pricingPages[lang], `${pkg.id}: JSON-LD monthly fee differs`);
      if (pkg.price.fullTime && specs[1]?.minPrice !== pkg.price.fullTime) fail(pricingPages[lang], `${pkg.id}: JSON-LD full-time rate differs`);
      if (specs.some((spec) => spec.valueAddedTaxIncluded !== false)) fail(pricingPages[lang], `${pkg.id}: JSON-LD must say VAT is excluded`);
    }
  }
  const faq = blocks.find((block) => block["@type"] === "FAQPage");
  const visibleQuestions = [...pricing.matchAll(/<summary>([^<]+)<\/summary>/g)].length;
  if (!faq || faq.mainEntity.length !== visibleQuestions) fail(pricingPages[lang], "FAQPage JSON-LD and the visible FAQ differ");
}

// The form: offers exactly the ids the server accepts, and its script loads.
const expectedOptions = ["", ...packages.map((pkg) => pkg.id), "other"].sort().join(",");
for (const file of formPages) {
  if (!existsSync(path.join(dist, file))) continue;
  const html = read(file);
  const form = html.match(/<form class="contact-form"[\s\S]*?<\/form>/)?.[0];
  if (!form) {
    fail(file, "no contact form");
    continue;
  }
  const options = [...form.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]).sort().join(",");
  if (options !== expectedOptions) fail(file, `form options [${options}] differ from packages.mjs`);
  if (!/data-clarity-mask="true"/.test(form)) fail(file, "form is not masked from Clarity recordings");
  const script = html.match(/<script[^>]+src="\/(contact\.[0-9a-f]{8}\.js)"/);
  if (!script) fail(file, "contact.js is not loaded (or not content-hashed)");
  else if (!existsSync(path.join(dist, script[1]))) fail(file, `${script[1]} is not in dist/`);
}

// The footer names the engagements the pricing page sells.
for (const [lang, partial] of [["en", "partials/footer.html"], ["hr", "partials/hr/footer.html"]]) {
  const footer = readFileSync(path.join(root, partial), "utf8");
  for (const pkg of packages.filter((p) => p.group === "engagement")) {
    if (!footer.includes(`>${pkg[lang].name}</a>`)) fail(partial, `footer does not list "${pkg[lang].name}"`);
  }
}

if (failures.length) {
  console.error(`Pricing checks failed:\n${failures.map((line) => `  - ${line}`).join("\n")}`);
  process.exit(1);
}
console.log(`Pricing checks passed for ${packages.length} package(s) across ${formPages.length} page(s).`);
