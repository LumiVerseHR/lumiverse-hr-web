// Share cards (1200x630) for the pages that have no picture of their own.
// Reads each page's label, heading and intro from the running site, so a card
// always says what the page says, and pairs it with real imagery from public/.
//
//   node design-src/og-cards.mjs [http://localhost:3391]  ->  public/og/pages/<lang>-<page>.jpg
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const BASE = process.argv[2] ?? "http://localhost:3391";
const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/og/pages");

// The lockup from public/assets/brand/logo, cropped to its ink (the file carries clear space).
const LOGO = (() => {
  const dir = path.join(ROOT, "public/assets/brand/logo");
  const pad = JSON.parse(readFileSync(path.join(dir, "construction.json"), "utf8")).lockup.clear_space;
  const svg = readFileSync(path.join(dir, "lumiverse-logo-dark.svg"), "utf8");
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  return svg.replace(/viewBox="[^"]+"/, `viewBox="${pad} ${pad} ${w - 2 * pad} ${h - 2 * pad}"`).replace(/ width="[^"]+" height="[^"]+"/, "");
})();
mkdirSync(OUT, { recursive: true });

const { packaged, priceParts } = await import(path.join(ROOT, "src/content/packages.mjs"));

// An exhibit on the plinth: the hero's stage plus one solid device, stacked as on the homepage.
const exhibit = (product) => ({ layers: ["/hero/stage.webp", `/hero/solid-${product}.webp`] });
const still = (src, fit = "cover") => ({ src, fit });

const pages = [
  { name: "home", path: "/", art: exhibit("bridj") },
  { name: "work", path: "/work", art: { grid: ["/og/moj-kolega.jpg", "/og/overserved.jpg", "/og/lider-translations.jpg", "/og/titlomat.jpg"] } },
  { name: "services", path: "/services", art: exhibit("moj-kolega") },
  { name: "packages", path: "/packages", art: { grid: ["/packages/evidence/hero.webp", "/packages/evidence/overserved-play.webp", "/packages/evidence/mojkolega-chat.webp", "/packages/evidence/titlomat.webp"] } },
  { name: "pricing", path: "/pricing", art: exhibit("titlomat") },
  { name: "research", path: "/research", art: still("/work/air-laser/airlaser-wire.jpg", "contain") },
  { name: "studio", path: "/studio", art: still("/blog/laser-cut-hero/exhibits.webp") },
  { name: "contact", path: "/contact", art: exhibit("moj-kolega") },
  { name: "blog", path: "/blog", art: still("/blog/laser-cut-hero/cover.webp") },
  { name: "tech-lead", path: "/tech-lead", art: still("/og/bridj.jpg") },
  { name: "technical-founder", path: "/technical-founder", art: still("/og/overserved.jpg") },
  ...packaged.map((pkg) => {
    const cover = pkg.pack.work?.find((w) => w.shape !== "tall") ?? pkg.pack.work?.[0];
    return { name: `packages-${pkg.id}`, path: `/packages/${pkg.id}`, art: still(cover.poster), pkg };
  }),
];

const css = `
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; background: #0e0f12; color: #f7f7f6; font-family: "Golos Text", sans-serif; overflow: hidden; }
  body::before { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 70% at 78% 0%, rgb(255 210 166 / 0.13), transparent 70%); }
  .card { position: relative; display: grid; grid-template-columns: 560px 1fr; height: 630px; }
  .text { display: flex; flex-direction: column; padding: 56px 0 52px 64px; }
  .label { color: #c9a57a; font-family: "Barlow Condensed", sans-serif; font-style: italic; font-weight: 600; font-size: 30px; }
  h1 { margin-top: 18px; font-size: 68px; line-height: 0.95; letter-spacing: -0.04em; font-weight: 700; text-wrap: balance; }
  h1.long { font-size: 56px; }
  p.intro { margin-top: 22px; color: #cacaca; font-size: 23px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  .price { margin-top: 26px; font-size: 44px; font-weight: 700; letter-spacing: -0.03em; }
  .price small { margin-left: 10px; color: #cacaca; font-size: 22px; font-weight: 500; letter-spacing: 0; }
  .foot { margin-top: auto; display: flex; align-items: center; gap: 18px; font-size: 22px; color: #cacaca; }
  .logo svg { display: block; height: 34px; width: auto; }
  .art { position: relative; margin: 48px 48px 48px 8px; }
  .frame { position: absolute; inset: 0; overflow: hidden; border: 10px solid #0a0a0b; outline: 1px solid rgb(255 255 255 / 0.08); background: #111116; box-shadow: 0 30px 70px rgb(0 0 0 / 0.6); }
  .frame img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
  .frame.contain { background: #fff; } .frame.contain img { object-fit: contain; object-position: center; }
  /* A still keeps its own ratio, centred in the column, so nothing is cropped. */
  .art.still { display: flex; align-items: center; }
  .frame.natural { position: relative; inset: auto; width: 100%; }
  .frame.natural img { height: auto; }
  .grid { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .grid div { position: relative; }
  .layers { position: absolute; inset: -48px -48px -48px -40px; }
  .layers img { position: absolute; width: 112%; left: -6%; top: 50%; transform: translateY(-46%); }
`;

function html(page, data) {
  const a = page.art;
  let art;
  if (a.layers) art = `<div class="layers">${a.layers.map((s) => `<img src="${BASE}${s}">`).join("")}</div>`;
  else if (a.grid) art = `<div class="grid">${a.grid.map((s) => `<div><div class="frame"><img src="${BASE}${s}"></div></div>`).join("")}</div>`;
  else art = `<div class="frame ${a.fit === "contain" ? "contain" : "natural"}"><img src="${BASE}${a.src}"></div>`;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;700&family=Barlow+Condensed:ital,wght@1,600&display=block" rel="stylesheet">
<style>${css}</style></head><body><div class="card">
<div class="text">
  ${data.label ? `<div class="label">${data.label}</div>` : ""}
  <h1 class="${data.title.length > 34 ? "long" : ""}">${data.title}</h1>
  ${data.price ? `<div class="price">${data.price}<small>${data.unit}</small></div>` : data.intro ? `<p class="intro">${data.intro}</p>` : ""}
  <div class="foot"><span class="logo">${LOGO}</span><span>${data.host}</span></div>
</div>
<div class="art ${a.src && a.fit !== "contain" ? "still" : ""}">${art}</div>
</div></body></html>`;
}

// Whole sentences up to about `max` characters, so an intro never stops mid-thought.
function sentences(text, max) {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  let out = "";
  for (const part of parts) {
    if (out && (out + part).length > max) break;
    out += part;
  }
  return out.trim();
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const browser = await chromium.launch();
const reader = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
let n = 0;
for (const lang of ["en", "hr"]) {
  for (const page of pages) {
    const url = BASE + (lang === "en" ? page.path : `/hr${page.path === "/" ? "" : page.path}`);
    await reader.goto(url, { waitUntil: "domcontentloaded" });
    const data = await reader.evaluate(() => {
      const h1 = document.querySelector("h1");
      const crumb = document.querySelector('nav[aria-label="Breadcrumb"] [aria-current="page"]');
      const intro = h1?.parentElement?.querySelector("h1 ~ p")?.textContent ?? "";
      return { title: h1?.textContent?.replace(/\s+/g, " ").trim() ?? "", label: crumb?.textContent ?? "", intro: intro.trim() };
    });
    if (page.name === "home") {
      // The headline cycles; the card carries the first one.
      data.title = lang === "hr" ? "Ljudska mašta. AI brzina." : "Human Imagination. AI Speed.";
      data.label = "";
    }
    if (page.pkg) {
      const p = priceParts(page.pkg.price, lang);
      data.price = `${p.lead ? p.lead + " " : ""}${p.amount}`;
      data.unit = `${p.unit} · ${page.pkg.pack.delivery[lang]}`;
      data.label = lang === "hr" ? "Paket" : "Package";
    }
    data.title = esc(data.title);
    data.intro = esc(sentences(data.intro, 130));
    data.host = "lumiverse.hr" + (lang === "hr" ? "/hr" : "");
    await card.setContent(html(page, data), { waitUntil: "networkidle" });
    await card.evaluate(() => document.fonts.ready);
    const png = await card.screenshot({ type: "png" });
    await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, `${lang}-${page.name}.jpg`));
    n++;
  }
}
await browser.close();
console.log(`${n} cards in ${path.relative(ROOT, OUT)}`);
