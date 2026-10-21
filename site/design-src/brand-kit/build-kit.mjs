// The LumiVerse brand kit: every ready-made visual a company needs, rendered from the
// generated logo (public/assets/brand/logo) with the real fonts, in one run.
//
//   node design-src/brand-kit/build-kit.mjs  ->  public/assets/brand/kit/*  + kit.json
//
// Run design-src/logo/build_logo.py first if the logo changed. DOCX templates come from
// build_docx.py, which reads the PNGs this script writes.
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const ROOT = path.resolve(import.meta.dirname, "../..");
const LOGO = path.join(ROOT, "public/assets/brand/logo");
const OUT = path.join(ROOT, "public/assets/brand/kit");
const PUB = path.join(ROOT, "public");
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- tokens --
const T = {
  wall: "#0e0f12", deep: "#0a0a0c", placard: "#0b0b0c", coral: "#ff4d4d", action: "#e03131",
  basswood: "#c9a57a", text: "#f7f7f6", text2: "#cacaca", muted: "#8f8e8b", ink: "#0e0f12",
};

export const COMPANY = {
  name: "LumiVerse d.o.o.",
  street: "Markuševečka cesta 20C",
  city: "10000 Zagreb, Hrvatska",
  oib: "88595646800",
  mbs: "081511108",
  court: "Trgovački sud u Zagrebu",
  capital: "2.500,00 EUR",
  iban: "HR94 2340 0091 1112 3354 4",
  bank: "Privredna banka Zagreb d.d.",
  swift: "PBZGHR2X",
  email: "info@lumiverse.hr",
  web: "lumiverse.hr",
};

// ------------------------------------------------------------------ logo --
const C = JSON.parse(readFileSync(path.join(LOGO, "construction.json"), "utf8"));
const PAD = C.lockup.clear_space;
const SYMBOL_D = C.polygons.map((p) => "M" + p.map((q) => q.join(" ")).join(" ") + "Z").join("");
const [SW, SH] = C.symbol_size;

const symbol = (fill, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 ${SW} ${SH}" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" d="${SYMBOL_D}"/></svg>`;

// A lockup file cropped to its ink: the files carry one stem of clear space all round.
function lockup(file, cls = "") {
  let svg = readFileSync(path.join(LOGO, file), "utf8");
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  svg = svg
    .replace(/viewBox="[^"]+"/, `viewBox="${PAD} ${PAD} ${w - 2 * PAD} ${h - 2 * PAD}"`)
    .replace(/ width="[^"]+" height="[^"]+"/, "")
    .replace(/<title>.*?<\/title>/, "")
    .replace("<svg ", `<svg class="${cls}" `);
  return svg;
}

// ----------------------------------------------------------------- fonts --
const b64 = (f) => readFileSync(f).toString("base64");
const FONTS = `
@font-face { font-family: "Golos Text"; font-weight: 400 900; src: url(data:font/ttf;base64,${b64(path.join(ROOT, "design-src/logo/GolosText[wght].ttf"))}) format("truetype"); }
@font-face { font-family: "Barlow Condensed"; font-style: italic; font-weight: 600; src: url(data:font/ttf;base64,${b64(path.join(import.meta.dirname, "BarlowCondensed-SemiBoldItalic.ttf"))}) format("truetype"); }`;

const BASE = `${FONTS}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: ${T.wall}; color: ${T.text}; font-family: "Golos Text", sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }
.label { font-family: "Barlow Condensed", sans-serif; font-style: italic; font-weight: 600; color: ${T.basswood}; }
.lamp { position: absolute; inset: 0; pointer-events: none; }
svg { display: block; }
`;

const img = (rel) => `data:image/webp;base64,${b64(path.join(PUB, rel))}`;
const STAGE = img("hero/stage.webp");
const DEVICE = { "moj-kolega": img("hero/solid-moj-kolega.webp"), bridj: img("hero/solid-bridj.webp"), titlomat: img("hero/solid-titlomat.webp") };

// The exhibit on the plinth, as on the homepage: stage and one solid device, stacked.
const exhibit = (product, style) =>
  `<div class="exhibit" style="position:absolute;${style};aspect-ratio:1600/1100">
     <img src="${STAGE}" style="position:absolute;inset:0;width:100%;height:100%">
     <img src="${DEVICE[product]}" style="position:absolute;inset:0;width:100%;height:100%">
   </div>`;

// Lamplight from above at (x, y), in percent of the canvas.
const lamp = (x, y, a = 0.14, rx = 60, ry = 80) =>
  `<div class="lamp" style="background:radial-gradient(${rx}% ${ry}% at ${x}% ${y}%, rgb(255 210 166 / ${a}), transparent 70%)"></div>`;

// ------------------------------------------------------------- templates --
function icon({ size, bg, fg, scale = 0.62 }) {
  return { w: size, h: size, html: `<div style="width:${size}px;height:${size}px;background:${bg};display:grid;place-items:center">
      <div style="width:${scale * 100}%">${symbol(fg)}</div></div>` };
}

function banner({ w, h, product = "moj-kolega", text, ex, logoH, tagline = true, tagSize, short = false }) {
  // text: { left | right, top } in px; ex: { left, bottom, height } in px.
  const align = text.right != null ? "right" : "left";
  const pos = text.right != null ? `right:${text.right}px` : `left:${text.left}px`;
  const ts = tagSize ?? Math.round(logoH * 0.36);
  return { w, h, html: `
    <div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;background:${T.wall}">
      ${lamp(ex.left / w * 100 + (ex.height * 1.45 / w * 50), 0, 0.16, 45, 95)}
      ${exhibit(product, `left:${ex.left}px;bottom:${ex.bottom}px;height:${ex.height}px`)}
      <div style="position:absolute;${pos};top:${text.top}px;display:flex;flex-direction:column;align-items:${align === "right" ? "flex-end" : "flex-start"};gap:${Math.round(logoH * 0.5)}px">
        ${lockup("lumiverse-logo-dark.svg").replace("<svg ", `<svg style="height:${logoH}px;width:auto" `)}
        ${tagline ? `<div style="font-size:${ts}px;color:${T.text2};letter-spacing:-0.005em;text-align:${align};white-space:nowrap">AI product studio in Zagreb.${short ? "" : ` <span style="color:${T.text}">Ambitious products, shipped and checked.</span>`}</div>` : ""}
      </div>
    </div>` };
}

function poster({ w, h, product, headline = ["Human", "Imagination.", "AI Speed."], hs, logoH, pad, exH, exBottom }) {
  return { w, h, html: `
    <div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;background:${T.wall}">
      ${lamp(50, 0, 0.15, 70, 70)}
      ${exhibit(product, `left:50%;transform:translateX(-50%);bottom:${exBottom}px;height:${exH}px`)}
      <div style="position:absolute;left:${pad}px;top:${pad}px">
        ${lockup("lumiverse-logo-dark.svg").replace("<svg ", `<svg style="height:${logoH}px;width:auto" `)}
        <div style="margin-top:${Math.round(pad * 0.9)}px;font-weight:700;font-size:${hs}px;line-height:.9;letter-spacing:-0.04em">${headline.join("<br>")}</div>
        <div style="margin-top:${Math.round(hs * 0.35)}px;font-size:${Math.round(hs * 0.22)}px;color:${T.text2};max-width:22ch;line-height:1.35">AI product studio in Zagreb. Ambitious products, shipped and checked.</div>
      </div>
    </div>` };
}

function ad({ w, h, vertical }) {
  const cta = (fs) => `<span style="white-space:nowrap;display:inline-flex;align-items:center;gap:${fs * 0.4}px;background:${T.action};color:#fff;font-weight:500;font-size:${fs}px;padding:${fs * 0.6}px ${fs * 0.85}px">Start a Project →</span>`;
  if (!vertical)
    return { w, h, html: `<div style="position:relative;width:${w}px;height:${h}px;background:${T.wall};display:flex;align-items:center;justify-content:space-between;padding:0 22px;overflow:hidden">
      ${lamp(20, 0, 0.16, 40, 140)}
      ${lockup("lumiverse-logo-dark.svg").replace("<svg ", `<svg style="height:${h * 0.3}px;width:auto;position:relative;flex:none" `)}
      <span style="position:relative;font-size:15px;color:${T.text2};white-space:nowrap">Ambitious products, <span style="color:${T.text}">shipped and checked.</span></span>
      <span style="position:relative">${cta(14)}</span></div>` };
  return { w, h, html: `<div style="position:relative;width:${w}px;height:${h}px;background:${T.wall};overflow:hidden;padding:22px">
      ${lamp(50, 0, 0.16, 70, 70)}
      ${lockup("lumiverse-logo-dark.svg").replace("<svg ", `<svg style="height:26px;width:auto;position:relative" `)}
      <div style="position:relative;margin-top:22px;font-weight:700;font-size:34px;line-height:.92;letter-spacing:-0.04em">Human<br>Imagination.<br>AI Speed.</div>
      <div style="position:absolute;left:22px;bottom:22px">${cta(14)}</div></div>` };
}

function slide({ kind }) {
  const w = 1920, h = 1080;
  if (kind === "title")
    return { w, h, html: `<div style="position:relative;width:${w}px;height:${h}px;background:${T.wall};overflow:hidden">
      ${lamp(22, 0, 0.16, 50, 90)}
      <div style="position:absolute;left:120px;top:110px">${lockup("lumiverse-logo-dark.svg").replace("<svg ", `<svg style="height:64px;width:auto" `)}</div>
      <div style="position:absolute;left:120px;bottom:120px;right:120px;display:flex;justify-content:space-between;align-items:flex-end">
        <div style="font-weight:700;font-size:150px;line-height:.9;letter-spacing:-0.04em">Title of<br>the talk.</div>
        <div class="label" style="font-size:34px">lumiverse.hr</div></div></div>` };
  return { w, h, html: `<div style="position:relative;width:${w}px;height:${h}px;background:${T.wall};overflow:hidden">
      ${lamp(50, 0, 0.08, 70, 60)}
      <div style="position:absolute;left:120px;right:120px;bottom:64px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgb(255 255 255 / .12);padding-top:28px">
        ${lockup("lumiverse-logo-dark.svg").replace("<svg ", `<svg style="height:34px;width:auto" `)}
        <div class="label" style="font-size:28px">01</div></div></div>` };
}

function callBackground() {
  const w = 1920, h = 1080;
  return { w, h, html: `<div style="position:relative;width:${w}px;height:${h}px;background:${T.wall};overflow:hidden">
    ${lamp(78, 0, 0.13, 45, 85)}
    ${exhibit("moj-kolega", "right:-60px;bottom:-40px;height:620px;opacity:.9")}
    <div style="position:absolute;right:90px;top:80px">${lockup("lumiverse-logo-dark.svg").replace("<svg ", `<svg style="height:54px;width:auto" `)}</div></div>` };
}

// Print: A4 is 794x1123 CSS px at 96dpi. The same HTML renders the PDF and its preview.
const A4 = { w: 794, h: 1123 };
const legal = () => `${COMPANY.name} · ${COMPANY.street}, ${COMPANY.city} · OIB ${COMPANY.oib} · MBS ${COMPANY.mbs}, ${COMPANY.court} · Temeljni kapital ${COMPANY.capital}`;
const bankLine = () => `IBAN ${COMPANY.iban} · ${COMPANY.bank} · SWIFT ${COMPANY.swift} · ${COMPANY.email} · ${COMPANY.web}`;

const PAPER = `
  html, body { background: #fff; color: ${T.ink}; }
  .sheet { position: relative; width: ${A4.w}px; height: ${A4.h}px; background: #fff; overflow: hidden; }
  .head { position: absolute; left: 68px; right: 68px; top: 56px; display: flex; justify-content: space-between; align-items: flex-end; }
  .foot { position: absolute; left: 68px; right: 68px; bottom: 44px; border-top: 1px solid #d9d7d3; padding-top: 10px; font-size: 8px; line-height: 1.6; color: #55534f; }
  .meta { font-size: 9.5px; color: #55534f; text-align: right; line-height: 1.5; }
`;

function letterhead({ sample }) {
  const body = sample
    ? `<div style="position:absolute;left:68px;right:68px;top:190px;font-size:11px;line-height:1.6">
        <div style="color:#55534f">Zagreb, 21. listopada 2026.</div>
        <div style="margin-top:28px">Primatelj d.o.o.<br>Ulica i broj<br>10000 Zagreb</div>
        <div style="margin-top:34px;font-weight:700;font-size:15px;letter-spacing:-0.01em">Predmet: naslov dopisa</div>
        <p style="margin-top:16px">Poštovani,</p>
        <p style="margin-top:10px;color:#2a2926">Tekst dopisa piše se ovdje, Golos Text 400 u 11 pt, s proredom 1,6. Lijeva margina poravnata je s logotipom, a podnožje s podacima o tvrtki ostaje na svakoj stranici.</p>
        <p style="margin-top:28px">S poštovanjem,</p>
        <p style="margin-top:36px;font-weight:500">Ime Prezime</p><p style="color:#55534f">Funkcija</p></div>`
    : "";
  return { ...A4, paper: true, html: `<div class="sheet">
    <div class="head">${lockup("lumiverse-logo-light.svg").replace("<svg ", `<svg style="height:30px;width:auto" `)}
      <div class="meta">${COMPANY.street}<br>${COMPANY.city}<br>${COMPANY.email} · ${COMPANY.web}</div></div>
    ${body}
    <div class="foot">${legal()}<br>${bankLine()}</div></div>` };
}

function memo({ lang }) {
  const L = lang === "hr"
    ? { title: "Memorandum", to: "Za", from: "Od", date: "Datum", re: "Predmet", cc: "Kopija", body: "Tekst memoranduma." }
    : { title: "Memorandum", to: "To", from: "From", date: "Date", re: "Subject", cc: "Cc", body: "Memo text." };
  const row = (k) => `<div style="display:grid;grid-template-columns:90px 1fr;padding:9px 0;border-top:1px solid #e4e2de"><span class="label" style="font-size:14px;color:#8a6a43">${k}</span><span style="font-size:11px;color:#9a9893">&nbsp;</span></div>`;
  return { ...A4, paper: true, html: `<div class="sheet">
    <div class="head">${lockup("lumiverse-logo-light.svg").replace("<svg ", `<svg style="height:30px;width:auto" `)}<div class="meta">${COMPANY.web}</div></div>
    <div style="position:absolute;left:68px;right:68px;top:170px">
      <div style="font-weight:700;font-size:44px;letter-spacing:-0.04em;line-height:1">${L.title}</div>
      <div style="margin-top:30px;border-bottom:1px solid #e4e2de">${[L.to, L.from, L.cc, L.date, L.re].map(row).join("")}</div>
      <div style="margin-top:26px;font-size:11px;line-height:1.6;color:#9a9893">${L.body}</div></div>
    <div class="foot">${legal()}<br>${bankLine()}</div></div>` };
}

// Business card: 85x55 mm plus 3 mm bleed each side = 91x61 mm (344x231 px at 96dpi).
const MM = 96 / 25.4;
const CARD = { w: Math.round(91 * MM), h: Math.round(61 * MM) };
function card({ side }) {
  const bleed = 3 * MM, safe = bleed + 4 * MM;
  if (side === "front")
    return { ...CARD, print: { width: "91mm", height: "61mm" }, html: `<div style="position:relative;width:${CARD.w}px;height:${CARD.h}px;background:${T.wall};display:grid;place-items:center;overflow:hidden">
      ${lamp(50, 0, 0.16, 70, 90)}<div style="width:96px;position:relative">${symbol(T.coral)}</div></div>` };
  return { ...CARD, print: { width: "91mm", height: "61mm" }, html: `<div style="position:relative;width:${CARD.w}px;height:${CARD.h}px;background:#fff;color:${T.ink};overflow:hidden">
    <div style="position:absolute;left:${safe}px;top:${safe}px">${lockup("lumiverse-logo-light.svg").replace("<svg ", `<svg style="height:15px;width:auto" `)}</div>
    <div style="position:absolute;left:${safe}px;bottom:${safe}px;font-size:8.5px;line-height:1.5">
      <div style="font-weight:700;font-size:11.5px;letter-spacing:-0.01em">Ime Prezime</div>
      <div style="color:#55534f">Funkcija</div>
      <div style="margin-top:7px">ime@lumiverse.hr · +385 00 000 0000</div>
      <div style="color:#55534f">${COMPANY.street}, 10000 Zagreb · ${COMPANY.web}</div></div></div>` };
}

function signatureLogo() {
  // Shown at 180x? px in mail; rendered at 3x on white so dark-mode clients keep it legible.
  return { w: 540, h: 120, html: `<div style="width:540px;height:120px;background:#fff;display:flex;align-items:center;padding:0 6px">
    ${lockup("lumiverse-logo-light.svg").replace("<svg ", `<svg style="height:96px;width:auto" `)}</div>` };
}

function printLogo({ file, bg }) {
  return { w: 2000, h: 400, transparent: !bg, html: `<div style="width:2000px;height:400px;${bg ? `background:${bg};` : ""}display:grid;place-items:center">
    ${lockup(file).replace("<svg ", `<svg style="height:250px;width:auto" `)}</div>` };
}

// ----------------------------------------------------------------- the set --
const S = 1080;
const ASSETS = [
  // Icons
  { group: "icons", id: "favicon", title: "Favicon", use: "Browser tab. SVG for modern browsers, ICO with 16/32/48 for the rest.", files: ["favicon.svg", "favicon.ico"], render: icon({ size: 512, bg: T.wall, fg: T.coral, scale: 0.8 }), out: null },
  { group: "icons", id: "app-icon", title: "App icon", use: "Home-screen icon (iOS 180, Android 192/512).", files: ["apple-touch-icon.png", "icon-192.png", "icon-512.png"], render: icon({ size: 512, bg: T.wall, fg: T.coral, scale: 0.62 }), out: "icon-512.png" },
  { group: "icons", id: "maskable", title: "Maskable icon", use: "Android adaptive icon: symbol inside the 80% safe circle.", files: ["icon-maskable-512.png"], render: icon({ size: 512, bg: T.wall, fg: T.coral, scale: 0.5 }), out: "icon-maskable-512.png" },

  // Avatars
  { group: "avatars", id: "avatar-coral", title: "Avatar, coral on dark", use: "Default profile picture: LinkedIn, X, GitHub, Slack, YouTube. Safe for round crops.", files: ["avatar-coral-on-dark-800.png"], render: icon({ size: 800, bg: T.wall, fg: T.coral, scale: 0.56 }), out: "avatar-coral-on-dark-800.png" },
  { group: "avatars", id: "avatar-white", title: "Avatar, white on coral", use: "Where the default disappears on a dark UI.", files: ["avatar-white-on-coral-800.png"], render: icon({ size: 800, bg: T.coral, fg: "#ffffff", scale: 0.56 }), out: "avatar-white-on-coral-800.png" },
  { group: "avatars", id: "avatar-light", title: "Avatar, coral on white", use: "Light directories, marketplaces, partner listings.", files: ["avatar-coral-on-white-800.png"], render: icon({ size: 800, bg: "#ffffff", fg: T.coral, scale: 0.56 }), out: "avatar-coral-on-white-800.png" },

  // Social covers
  { group: "social", id: "linkedin-company", title: "LinkedIn company cover", use: "1128×191. The page logo overlaps bottom-left, so the text sits right.", files: ["linkedin-company-cover-1128x191.png"], render: banner({ w: 1128, h: 191, logoH: 34, text: { right: 64, top: 62 }, ex: { left: 260, bottom: -80, height: 330 }, tagSize: 14, short: true }), out: "linkedin-company-cover-1128x191.png" },
  { group: "social", id: "linkedin-personal", title: "LinkedIn profile banner", use: "1584×396, for team profiles. The photo covers bottom-left.", files: ["linkedin-profile-banner-1584x396.png"], render: banner({ w: 1584, h: 396, logoH: 54, text: { right: 96, top: 140 }, ex: { left: 380, bottom: -110, height: 560 }, tagSize: 20, short: true }), out: "linkedin-profile-banner-1584x396.png" },
  { group: "social", id: "x-header", title: "X header", use: "1500×500.", files: ["x-header-1500x500.png"], render: banner({ w: 1500, h: 500, logoH: 60, text: { left: 90, top: 170 }, ex: { left: 760, bottom: -150, height: 760 }, tagSize: 21 }), out: "x-header-1500x500.png" },
  { group: "social", id: "facebook", title: "Facebook cover", use: "851×315. Mobile crops the sides; content stays central.", files: ["facebook-cover-851x315.png"], render: banner({ w: 851, h: 315, logoH: 40, text: { left: 110, top: 112 }, ex: { left: 420, bottom: -90, height: 470 }, tagSize: 14 }), out: "facebook-cover-851x315.png" },
  { group: "social", id: "youtube", title: "YouTube channel banner", use: "2560×1440. Everything inside the 1546×423 safe area.", files: ["youtube-banner-2560x1440.png"], render: banner({ w: 2560, h: 1440, logoH: 84, text: { left: 560, top: 610 }, ex: { left: 1300, bottom: 360, height: 760 }, tagSize: 28 }), out: "youtube-banner-2560x1440.png" },
  { group: "social", id: "og", title: "Share card", use: "1200×630, the default link preview (Open Graph).", files: ["og-default-1200x630.png"], render: banner({ w: 1200, h: 630, logoH: 62, text: { left: 72, top: 236 }, ex: { left: 560, bottom: -120, height: 860 }, tagSize: 20 }), out: "og-default-1200x630.png" },
  { group: "social", id: "instagram-post", title: "Instagram post", use: "1080×1080.", files: ["instagram-post-1080x1080.png"], render: poster({ w: S, h: S, product: "bridj", hs: 112, logoH: 48, pad: 80, exH: 600, exBottom: -150 }), out: "instagram-post-1080x1080.png" },
  { group: "social", id: "instagram-story", title: "Story / Reel cover", use: "1080×1920, Instagram and LinkedIn stories.", files: ["story-1080x1920.png"], render: poster({ w: S, h: 1920, product: "moj-kolega", hs: 150, logoH: 56, pad: 96, exH: 900, exBottom: 120 }), out: "story-1080x1920.png" },

  // Meetings and presentations
  { group: "meetings", id: "call-bg", title: "Video call background", use: "1920×1080 for Zoom, Meet and Teams. The logo sits top-right, clear of your head.", files: ["video-call-background-1920x1080.png"], render: callBackground(), out: "video-call-background-1920x1080.png" },
  { group: "meetings", id: "slide-title", title: "Slide, title", use: "1920×1080 background for a title slide.", files: ["slide-title-1920x1080.png"], render: slide({ kind: "title" }), out: "slide-title-1920x1080.png" },
  { group: "meetings", id: "slide-content", title: "Slide, content", use: "1920×1080 background with the footer rule and page number.", files: ["slide-content-1920x1080.png"], render: slide({ kind: "content" }), out: "slide-content-1920x1080.png" },

  // Email
  { group: "email", id: "signature", title: "Email signature", use: "Logo PNG at 3× on white (shown at 180 px) and a paste-ready HTML signature.", files: ["email-signature-logo.png", "email-signature.html"], render: signatureLogo(), out: "email-signature-logo.png" },

  // Print and documents
  { group: "documents", id: "invoice-logo", title: "Invoice logo", use: "For invoicing software and PDFs. Colour and black, transparent PNG at 2000 px. Use the SVG where the tool accepts it.", files: ["invoice-logo-colour.png", "invoice-logo-black.png", "../logo/lumiverse-logo-light.svg"], render: printLogo({ file: "lumiverse-logo-light.svg", bg: "#ffffff" }), out: null, preview: "invoice-logo-preview.png" },
  { group: "documents", id: "letterhead", title: "Letterhead", use: "A4, with the legal footer every business letter needs. PDF to print or stamp, DOCX to write in.", files: ["letterhead-a4.pdf", "letterhead-a4.docx", "letterhead-sample-a4.pdf"], render: letterhead({ sample: true }), out: null, preview: "letterhead-preview.png", pdf: [["letterhead-a4.pdf", letterhead({ sample: false })], ["letterhead-sample-a4.pdf", letterhead({ sample: true })]] },
  { group: "documents", id: "memo", title: "Memorandum", use: "A4 internal memo, English and Croatian. PDF and DOCX.", files: ["memo-en-a4.pdf", "memo-hr-a4.pdf", "memo-en-a4.docx", "memo-hr-a4.docx"], render: memo({ lang: "en" }), out: null, preview: "memo-preview.png", pdf: [["memo-en-a4.pdf", memo({ lang: "en" })], ["memo-hr-a4.pdf", memo({ lang: "hr" })]] },
  { group: "documents", id: "business-card", title: "Business card", use: "85×55 mm with 3 mm bleed, front and back, print-ready PDF. Name and role are placeholders.", files: ["business-card-85x55.pdf"], render: card({ side: "front" }), out: null, preview: "business-card-preview.png", cardPdf: "business-card-85x55.pdf" },

  // Ads
  { group: "ads", id: "leaderboard", title: "Leaderboard", use: "728×90 display ad.", files: ["ad-leaderboard-728x90.png"], render: ad({ w: 728, h: 90 }), out: "ad-leaderboard-728x90.png" },
  { group: "ads", id: "rectangle", title: "Medium rectangle", use: "300×250 display ad.", files: ["ad-rectangle-300x250.png"], render: ad({ w: 300, h: 250, vertical: true }), out: "ad-rectangle-300x250.png" },
];

// --------------------------------------------------------------- render --
const doc = (r) => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${r.paper ? PAPER : ""}
html, body { width: ${r.w}px; height: ${r.h}px; ${r.transparent ? "background: transparent;" : ""} }</style></head><body>${r.html}</body></html>`;

const browser = await chromium.launch();

async function shot(r, scale = 1) {
  const p = await browser.newPage({ viewport: { width: r.w, height: r.h }, deviceScaleFactor: scale });
  await p.setContent(doc(r), { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  const png = await p.screenshot({ type: "png", omitBackground: !!r.transparent });
  await p.close();
  return png;
}

async function pdf(file, r) {
  const p = await browser.newPage({ viewport: { width: r.w, height: r.h } });
  await p.setContent(doc(r), { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(OUT, file), printBackground: true, ...(r.print ?? { format: "A4" }), margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await p.close();
}

const write = (file, buf) => writeFileSync(path.join(OUT, file), buf);

// An ICO holding PNG frames (Vista+ format, read by every current browser).
function ico(frames) {
  const head = Buffer.alloc(6 + 16 * frames.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(frames.length, 4);
  let offset = head.length;
  frames.forEach(([size, buf], i) => {
    const o = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, o); head.writeUInt8(size >= 256 ? 0 : size, o + 1);
    head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(buf.length, o + 8); head.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...frames.map(([, b]) => b)]);
}

for (const a of ASSETS) {
  if (a.out) write(a.out, await shot(a.render));
  if (a.pdf) for (const [file, r] of a.pdf) await pdf(file, r);
  if (a.preview) write(a.preview, await sharp(await shot(a.render, 2)).resize({ width: 1000 }).png().toBuffer());
}

// Icons at their sizes, from the 512 masters.
const app = await shot(ASSETS.find((a) => a.id === "app-icon").render);
write("apple-touch-icon.png", await sharp(app).resize(180).png().toBuffer());
write("icon-192.png", await sharp(app).resize(192).png().toBuffer());
const fav = await shot(ASSETS.find((a) => a.id === "favicon").render);
const favFrames = await Promise.all([16, 32, 48].map(async (s) => [s, await sharp(fav).resize(s, s, { kernel: "lanczos3" }).png().toBuffer()]));
write("favicon.ico", ico(favFrames));
write("favicon-32.png", favFrames[1][1]);
copyFileSync(path.join(LOGO, "lumiverse-favicon.svg"), path.join(OUT, "favicon.svg"));

// Print logos: transparent, colour and black.
write("invoice-logo-colour.png", await shot(printLogo({ file: "lumiverse-logo-light.svg" })));
write("invoice-logo-black.png", await shot(printLogo({ file: "lumiverse-logo-black.svg" })));
// Cropped to the ink for the DOCX header (build_docx.py).
write("docx-header-logo.png", await sharp(readFileSync(path.join(OUT, "invoice-logo-colour.png"))).trim().png().toBuffer());

// Business card: two pages, front then back.
{
  const front = card({ side: "front" }), back = card({ side: "back" });
  const both = { ...front, html: front.html + `<div style="break-before:page"></div>` + back.html };
  await pdf("business-card-85x55.pdf", both);
  const [f, b] = [await shot(front, 3), await shot(back, 3)];
  const fw = (await sharp(f).metadata()).width, fh = (await sharp(f).metadata()).height;
  const gap = 60;
  write("business-card-preview.png", await sharp({ create: { width: fw * 2 + gap, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: f, left: 0, top: 0 }, { input: b, left: fw + gap, top: 0 }]).png().toBuffer().then((buf) => sharp(buf).resize({ width: 1000 }).png().toBuffer()));
}

// Email signature, paste-ready. Image URL points at the live site once published.
writeFileSync(path.join(OUT, "email-signature.html"), `<!-- LumiVerse email signature. Open in a browser, select all, copy, paste into your mail client's signature settings. -->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Golos Text',Arial,Helvetica,sans-serif;color:#0e0f12;font-size:13px;line-height:1.5">
  <tr><td style="padding-bottom:10px"><img src="https://lumiverse.hr/assets/brand/kit/email-signature-logo.png" width="180" height="40" alt="LumiVerse" style="display:block;border:0"></td></tr>
  <tr><td style="font-weight:600;font-size:14px">Ime Prezime</td></tr>
  <tr><td style="color:#55534f">Funkcija · LumiVerse d.o.o.</td></tr>
  <tr><td style="padding-top:6px"><a href="mailto:ime@lumiverse.hr" style="color:#0e0f12;text-decoration:none">ime@lumiverse.hr</a> · <a href="https://lumiverse.hr" style="color:#e03131;text-decoration:none">lumiverse.hr</a></td></tr>
  <tr><td style="color:#8f8e8b;font-size:11px;padding-top:6px">${COMPANY.street}, ${COMPANY.city}</td></tr>
</table>
`);

await browser.close();

// The asset page reads this.
const groups = {
  icons: "Icons", avatars: "Profile pictures", social: "Social covers and share cards",
  meetings: "Meetings and presentations", email: "Email", documents: "Print and documents", ads: "Display ads",
};
const manifest = {
  generated: new Date().toISOString().slice(0, 10),
  company: { ...COMPANY, legal: legal(), bankLine: bankLine() },
  groups,
  assets: ASSETS.map((a) => ({
    group: a.group, id: a.id, title: a.title, use: a.use,
    preview: a.preview ?? a.out ?? "icon-512.png",
    dark: !["documents", "email"].includes(a.group) && !a.id.includes("light"),
    files: a.files.map((f) => ({ name: path.basename(f), href: f, bytes: existsSync(path.join(OUT, f)) ? statSync(path.join(OUT, f)).size : null })),
  })),
};
writeFileSync(path.join(OUT, "kit.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`${ASSETS.length} assets in ${path.relative(ROOT, OUT)}`);
