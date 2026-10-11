// Figures for the post "How We Distilled Jev for MOJ KRAJ. Triage" (EN + HR).
// Every number is copied from the post itself. Each figure is drawn twice: a 760px desktop
// layout and a 380px phone layout, served with <picture> so labels stay readable on phones.
//
//   node design-src/blog-figures/distilling-jev.mjs  ->  public/blog/distilling-jev-for-mojkraj-triage/*.webp
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "public/blog/distilling-jev-for-mojkraj-triage");
mkdirSync(OUT, { recursive: true });

// The site's palette (globals.css). Basswood marks our model; coral stays reserved for people and actions.
const C = {
  bg: "#0c0c10",
  box: "#15161b",
  edge: "rgba(255,255,255,0.14)",
  grid: "rgba(255,255,255,0.07)",
  text: "#f7f7f6",
  soft: "#cacaca",
  muted: "#8f8e8b",
  wood: "#c9a57a",
};

const num = (v, lang, d = 1) => (lang === "hr" ? v.toFixed(d).replace(".", ",") : v.toFixed(d));
const pct = (v, lang, d = 1) => (lang === "hr" ? `${num(v, lang, d)} %` : `${num(v, lang, d)}%`);
const signed = (v, lang) => (v > 0 ? "+" : "−") + num(Math.abs(v), lang);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

function text(x, y, s, { size = 14, fill = C.text, anchor = "start", weight = 400, mono = false, italic = false } = {}) {
  const fam = mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "'Golos Text', sans-serif";
  return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ""}>${esc(s)}</text>`;
}
const line = (x1, y1, x2, y2, stroke = C.grid, w = 1, dash = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;

// A labelled box: first line bold, the rest secondary.
function box(x, y, w, h, lines, { accent = false, dashed = false } = {}) {
  const stroke = accent ? C.wood : C.edge;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.box}" stroke="${stroke}" stroke-width="${accent ? 1.5 : 1}"${dashed ? ' stroke-dasharray="5 4"' : ""}/>`;
  const lh = 20;
  const top = y + h / 2 - ((lines.length - 1) * lh) / 2 + 5;
  lines.forEach((l, i) => {
    s += text(x + w / 2, top + i * lh, l, { anchor: "middle", size: i === 0 ? 15 : 13.5, weight: i === 0 ? 600 : 400, fill: i === 0 ? (accent ? C.wood : C.text) : C.soft });
  });
  return s;
}
// A polyline arrow with an arrowhead at the last point.
function arrow(pts, { dashed = false, color = C.muted } = {}) {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const [a, b] = pts.slice(-2);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const hx = (t) => b[0] - 9 * Math.cos(ang + t);
  const hy = (t) => b[1] - 9 * Math.sin(ang + t);
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5"${dashed ? ' stroke-dasharray="5 4"' : ""}/>` +
    `<path d="M${hx(0.45)},${hy(0.45)} L${b[0]},${b[1]} L${hx(-0.45)},${hy(-0.45)}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
}

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${C.bg}"/>${body}</svg>`;

// ---------------------------------------------------------------- 1. openjev architecture
const T1 = {
  en: { app: ["Your app", "official TypeSafe SDK"], api: "POST /v1/systemone", oj: ["openjev", "Jev's API on our GPU", "keeps 8 GB of GPU free"], en: ["laya-en · 421M", "English text"], ml: ["laya-multilingual · 322M", "any other language"], ft: ["MOJ KRAJ. triage model", "fine-tune, asked for by name"], route: "routed by language" },
  hr: { app: ["Vaša aplikacija", "službeni TypeSafe SDK"], api: "POST /v1/systemone", oj: ["openjev", "Jevov API na našem GPU-u", "čuva 8 GB memorije GPU-a"], en: ["laya-en · 421M", "tekst na engleskom"], ml: ["laya-multilingual · 322M", "svi ostali jezici"], ft: ["MOJ KRAJ. trijažni model", "fino podešen, poziva se imenom"], route: "usmjereno po jeziku" },
};
function architecture(lang, narrow) {
  const t = T1[lang];
  if (!narrow) {
    const W = 760, H = 280;
    let s = box(0, 115, 150, 70, t.app);
    const [verb, route] = t.api.split(" ");
    s += arrow([[150, 150], [247, 150]]) + text(199, 140, verb, { anchor: "middle", size: 11, mono: true, fill: C.muted }) + text(199, 167, route, { anchor: "middle", size: 11, mono: true, fill: C.muted });
    s += box(250, 105, 200, 90, t.oj);
    const ys = [22, 118, 214];
    [t.en, t.ml, t.ft].forEach((l, i) => {
      s += box(525, ys[i], 235, 64, l, { accent: i === 2 });
      s += arrow([[450, 150], [485, 150], [485, ys[i] + 32], [522, ys[i] + 32]]);
    });
    return svg(W, H, s);
  }
  const W = 380, H = 560;
  let s = box(70, 0, 240, 64, t.app);
  s += arrow([[190, 64], [190, 112]]) + text(200, 93, t.api, { size: 11, mono: true, fill: C.muted });
  s += box(55, 115, 270, 88, t.oj);
  const ys = [270, 370, 470];
  s += line(24, 236, 24, ys[2] + 32, C.muted, 1.5) + line(24, 236, 190, 236, C.muted, 1.5) + line(190, 203, 190, 236, C.muted, 1.5);
  s += text(200, 228, t.route, { size: 12, fill: C.muted });
  [t.en, t.ml, t.ft].forEach((l, i) => {
    s += box(56, ys[i], 324, 64, l, { accent: i === 2 });
    s += arrow([[24, ys[i] + 32], [53, ys[i] + 32]]);
  });
  return svg(W, H, s);
}

// ---------------------------------------------------------------- 2. zero-shot benchmark (dot + whisker)
const tasks = [
  // en, hr, n, trained, jev, laya, diff, lo, hi
  ["AG News topic, 4 options", "AG News tema, 4 opcije", 200, 1, 86.5, 93.5, 7.0, 2.0, 12.5],
  ["Emotion, 6 options", "Emocija, 6 opcija", 210, 0, 49.5, 44.3, -5.2, -12.4, 1.4],
  ["Prompt-injection check, yes/no", "Provjera prompt injectiona, da/ne", 116, 0, 75.9, 70.7, -5.2, -13.8, 3.4],
  ["XNLI in 5 languages", "XNLI na 5 jezika", 750, 0, 77.7, 71.1, -6.7, -10.3, -2.9],
  ["BoolQ, passage first", "BoolQ, prvo odlomak", 300, 1, 92.3, 83.0, -9.3, -14.0, -5.0],
  ["SIB-200 topic, Croatian + English", "SIB-200 tema, hrvatski + engleski", 408, 0, 91.2, 78.2, -13.0, -17.4, -8.8],
  ["Yelp stars, 5-level score", "Yelp zvjezdice, ocjena u 5 razina", 250, 0, 60.8, 33.6, -27.2, -34.4, -19.6],
  ["BoolQ, question first", "BoolQ, prvo pitanje", 300, 1, 90.7, 62.0, -28.7, -35.3, -22.0],
  ["typed-decisions, 4 workflows", "typed-decisions, 4 tijeka rada", 2000, 0, 73.8, 36.4, -37.4, -40.2, -34.4],
  ["Banking77 intent, 77 options", "Banking77 namjera, 77 opcija", 308, 0, 83.1, 44.5, -38.6, -44.2, -33.1],
  ["Browser agent next action", "Sljedeća akcija browser agenta", 22, 0, 100, 18.2, -81.8, -95.5, -63.6],
];
const T2 = {
  en: { trained: "Laya was trained on this dataset", other: "not trained on it, or unknown", axis: "Laya minus Jev, accuracy points (95% CI)", vals: "Jev → Laya", better: "Jev better ←", laya: "→ Laya better" },
  hr: { trained: "Laya je trenirana na ovom skupu podataka", other: "nije trenirana na njemu ili se ne zna", axis: "Laya minus Jev, postotni bodovi točnosti (95 % CI)", vals: "Jev → Laya", better: "Jev bolji ←", laya: "→ Laya bolja" },
};
function zeroShot(lang, narrow) {
  const t = T2[lang];
  const W = narrow ? 380 : 760;
  const x0 = narrow ? 0 : 268, x1 = narrow ? 290 : 618;
  const X = (v) => x0 + ((v + 100) / 120) * (x1 - x0);
  const top = narrow ? 58 : 46, rh = narrow ? 50 : 32;
  const H = top + tasks.length * rh + 56;
  let s = "";
  // legend
  s += `<circle cx="6" cy="14" r="5" fill="${C.wood}"/>` + text(18, 19, t.trained, { size: 13, fill: C.soft });
  const lx = narrow ? 0 : 320;
  const ly = narrow ? 36 : 14;
  s += `<circle cx="${lx + 6}" cy="${ly}" r="5" fill="${C.text}"/>` + text(lx + 18, ly + 5, t.other, { size: 13, fill: C.soft });
  if (!narrow) s += text(W, top - 8, t.vals, { anchor: "end", size: 12, fill: C.muted });
  // grid
  const gTop = top, gBot = top + tasks.length * rh;
  for (const v of [-100, -80, -60, -40, -20, 0, 20]) {
    s += line(X(v), gTop, X(v), gBot, v === 0 ? "rgba(255,255,255,0.35)" : C.grid, 1);
    s += text(X(v), gBot + 18, v > 0 ? `+${v}` : v === 0 ? "0" : `−${-v}`, { anchor: "middle", size: 12, fill: C.muted });
  }
  s += text((x0 + x1) / 2, gBot + 42, t.axis, { anchor: "middle", size: 12.5, fill: C.soft });
  tasks.forEach((r, i) => {
    const [en, hr, n, trained, jev, laya, d, lo, hi] = r;
    const name = `${lang === "hr" ? hr : en} (${n.toLocaleString(lang === "hr" ? "hr-HR" : "en-US")})`;
    const y = narrow ? top + i * rh + 34 : top + i * rh + rh / 2;
    if (narrow) s += text(0, y - 16, name, { size: 13, fill: C.text });
    else s += text(0, y + 5, name, { size: 13.5, fill: C.text });
    if (i) s += line(0, top + i * rh, W, top + i * rh, "rgba(255,255,255,0.04)");
    const col = trained ? C.wood : C.text;
    s += line(X(lo), y, X(hi), y, col, 2) + line(X(lo), y - 5, X(lo), y + 5, col, 1.5) + line(X(hi), y - 5, X(hi), y + 5, col, 1.5);
    s += `<circle cx="${X(d)}" cy="${y}" r="5" fill="${col}"/>`;
    s += text(W, y + 4.5, `${jev === 100 ? 100 : num(jev, lang)} → ${num(laya, lang)}`, { anchor: "end", size: 12.5, fill: C.soft });
    // On phones the task name sits right above the whisker, so the difference label would collide with it.
    if (!narrow) s += text(X(d), y - 9, signed(d, lang), { anchor: "middle", size: 11, fill: C.muted });
  });
  return svg(W, H, s);
}

// ---------------------------------------------------------------- 3. accuracy vs latency
const T3 = {
  en: { x: "Median latency per item, ms (log scale)", y: "Accuracy on clear gold labels", jev: "Jev 1.13, cloud", ds: "DeepSeek v4.1 flash, production", un: "Laya, untrained", ft: "Laya fine-tuned on Jev's answers", arrow: "2,000 Jev answers, 5 minutes of training", corner: "faster and more accurate" },
  hr: { x: "Medijan latencije po stavci, ms (log skala)", y: "Točnost na jasnim oznakama", jev: "Jev 1.13, cloud", ds: "DeepSeek v4.1 flash, produkcija", un: "Laya, netrenirana", ft: "Laya fino podešena na Jevovim odgovorima", arrow: "2.000 Jevovih odgovora, 5 minuta treninga", corner: "brže i točnije" },
};
function scatter(lang, narrow) {
  const t = T3[lang];
  const W = narrow ? 380 : 760, H = narrow ? 400 : 380;
  const L = 48, R = W - 10, Tp = narrow ? 84 : 56, B = H - 58;
  const X = (ms) => L + ((Math.log10(ms) - 1) / 2) * (R - L);
  const Y = (a) => B - ((a - 40) / 60) * (B - Tp);
  let s = "";
  for (const a of [40, 60, 80, 100]) s += line(L, Y(a), R, Y(a)) + text(L - 8, Y(a) + 4, `${a}`, { anchor: "end", size: 12, fill: C.muted });
  for (const ms of [10, 30, 100, 300, 1000]) s += line(X(ms), Tp, X(ms), B) + text(X(ms), B + 18, ms.toLocaleString(lang === "hr" ? "hr-HR" : "en-US"), { anchor: "middle", size: 12, fill: C.muted });
  s += text((L + R) / 2, B + 44, t.x, { anchor: "middle", size: 12.5, fill: C.soft });
  s += `<text transform="translate(12 ${(Tp + B) / 2}) rotate(-90)" font-family="'Golos Text', sans-serif" font-size="12.5" fill="${C.soft}" text-anchor="middle">${esc(t.y)} (%)</text>`;
  // the training jump
  s += arrow([[X(17), Y(48) - 10], [X(12.3), Y(94.4) + 12]], { dashed: true, color: C.wood });
  s += text(X(17) + 12, Y(71), t.arrow, { size: 12.5, fill: C.wood });
  const pts = [
    [269, 97.3, t.jev, C.text, "end", -12, -10],
    [647, 93.7, t.ds, C.muted, "end", -10, 22],
    [17, 48.0, t.un, C.muted, "start", 12, 5],
    [12, 94.4, t.ft, C.wood, "start", -6, narrow ? -52 : -32],
  ];
  for (const [ms, a, label, col, anchor, dx, dy] of pts) {
    s += `<circle cx="${X(ms)}" cy="${Y(a)}" r="${col === C.wood ? 7 : 6}" fill="${col}"/>`;
    s += text(X(ms) + dx, Y(a) + dy, label, { anchor, size: 13, fill: col === C.muted ? C.soft : col, weight: col === C.wood ? 600 : 400 });
    s += text(X(ms) + dx, Y(a) + dy + 16, `${pct(a, lang)} · ${ms} ms`, { anchor, size: 12, fill: C.muted });
  }
  return svg(W, H, s);
}

// ---------------------------------------------------------------- 4. learning curve
const curve = [[125, 89.3, 86.9], [250, 92.7, 90.6], [500, 93.7, 92.1], [1000, 93.7, 92.2], [2000, 94.4, 92.8]];
const T4 = {
  en: { gold: "Accuracy on blind gold labels", agree: "Agreement with Jev", jev: "Jev, the teacher", prod: "Production LLM", x: "Jev-labelled training items (log scale)" },
  hr: { gold: "Točnost na zlatnim oznakama naslijepo", agree: "Slaganje s Jevom", jev: "Jev, učitelj", prod: "Produkcijski LLM", x: "Stavke za trening koje je označio Jev (log skala)" },
};
function learning(lang, narrow) {
  const t = T4[lang];
  const W = narrow ? 380 : 760, H = narrow ? 380 : 360;
  const L = 44, R = narrow ? W - 14 : W - 170, Tp = narrow ? 62 : 40, B = H - 52;
  const X = (n) => L + (Math.log2(n / 125) / 4) * (R - L);
  const Y = (a) => B - ((a - 85) / 15) * (B - Tp);
  let s = "";
  // legend
  s += line(0, 12, 22, 12, C.wood, 2.5) + text(30, 17, t.gold, { size: 13, fill: C.soft });
  const lx = narrow ? 0 : 300, ly = narrow ? 36 : 12;
  s += line(lx, ly, lx + 22, ly, C.soft, 1.5, "4 3") + text(lx + 30, ly + 5, t.agree, { size: 13, fill: C.soft });
  for (const a of [85, 90, 95, 100]) s += line(L, Y(a), R, Y(a)) + text(L - 8, Y(a) + 4, `${a}`, { anchor: "end", size: 12, fill: C.muted });
  for (const [n] of curve) s += text(X(n), B + 18, n.toLocaleString(lang === "hr" ? "hr-HR" : "en-US"), { anchor: "middle", size: 12, fill: C.muted });
  s += text((L + R) / 2, B + 42, t.x, { anchor: "middle", size: 12.5, fill: C.soft });
  // reference lines
  const refs = [[97.3, t.jev, C.text, "6 4"], [93.7, t.prod, C.muted, "2 4"]];
  for (const [a, label, col, dash] of refs) {
    s += line(L, Y(a), R, Y(a), col, 1.2, dash);
    if (narrow) s += text(L + 4, Y(a) - 6, `${label} ${pct(a, lang)}`, { size: 12, fill: col === C.text ? C.soft : C.muted });
    else s += text(R + 10, Y(a) + 4, `${label} ${pct(a, lang)}`, { size: 12.5, fill: col === C.text ? C.soft : C.muted });
  }
  const path = (k) => curve.map(([n, ...v], i) => `${i ? "L" : "M"}${X(n)},${Y(v[k])}`).join(" ");
  s += `<path d="${path(1)}" fill="none" stroke="${C.soft}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  s += `<path d="${path(0)}" fill="none" stroke="${C.wood}" stroke-width="2.5"/>`;
  for (const [n, g, a] of curve) {
    s += `<circle cx="${X(n)}" cy="${Y(a)}" r="3" fill="${C.soft}"/>`;
    s += `<circle cx="${X(n)}" cy="${Y(g)}" r="4.5" fill="${C.wood}"/>`;
    // 500 and 1000 sit right on the production line, so their labels go below the agreement curve.
    // 125 and 250 sit under the production line, so their labels go below the point.
    // On phones the production label runs along its line on the left, so 500 and 1000 go below too.
    const below = n <= 250 || (narrow && (n === 500 || n === 1000));
    s += text(X(n) + (n === 125 ? 8 : 0), below ? Y(g) + 20 : Y(g) - 10, pct(g, lang), { anchor: n === 125 ? "start" : "middle", size: 12, fill: C.wood, weight: 600 });
  }
  return svg(W, H, s);
}

// ---------------------------------------------------------------- 5. cascade flow
const T5 = {
  en: { item: ["Intake item", "title + feed summary"], local: ["Local model", "4 questions · ~12 ms"], q: ["every answer", "p ≥ 0.6?"], yes: "yes", no: "no", done: ["Local decision", "~70% of items in testing"], llm: ["LLM decides", "production prompt, as before"], fail: "timeout · error · unreadable reply" },
  hr: { item: ["Ulazna stavka", "naslov + sažetak iz feeda"], local: ["Lokalni model", "4 pitanja · ~12 ms"], q: ["svaki odgovor", "p ≥ 0,6?"], yes: "da", no: "ne", done: ["Lokalna odluka", "~70 % stavki u testu"], llm: ["Odlučuje LLM", "produkcijski prompt, kao prije"], fail: "istek vremena · greška · nečitljiv odgovor" },
};
function diamond(cx, cy, w, h, lines) {
  let s = `<path d="M${cx},${cy - h / 2} L${cx + w / 2},${cy} L${cx},${cy + h / 2} L${cx - w / 2},${cy} Z" fill="${C.box}" stroke="${C.edge}"/>`;
  s += text(cx, cy - 3, lines[0], { anchor: "middle", size: 13, fill: C.soft });
  s += text(cx, cy + 15, lines[1], { anchor: "middle", size: 14, weight: 600 });
  return s;
}
function cascade(lang, narrow) {
  const t = T5[lang];
  if (!narrow) {
    const W = 760, H = 290;
    let s = box(0, 100, 140, 70, t.item);
    s += arrow([[140, 135], [172, 135]]);
    s += box(175, 100, 160, 70, t.local);
    s += arrow([[335, 135], [372, 135]]);
    s += diamond(445, 135, 146, 104, t.q);
    s += box(560, 18, 200, 70, t.done, { accent: true });
    s += box(560, 182, 200, 70, t.llm);
    s += arrow([[445, 83], [445, 53], [557, 53]], { color: C.wood }) + text(455, 72, t.yes, { size: 13, fill: C.wood, weight: 600 });
    s += arrow([[445, 187], [445, 217], [557, 217]]) + text(455, 206, t.no, { size: 13, fill: C.soft, weight: 600 });
    s += arrow([[255, 170], [255, 270], [660, 270], [660, 255]], { dashed: true });
    s += text(262, 262, t.fail, { size: 12, fill: C.muted });
    return svg(W, H, s);
  }
  const W = 380, H = 480;
  let s = box(95, 0, 190, 64, t.item);
  s += arrow([[190, 64], [190, 92]]);
  s += box(95, 95, 190, 64, t.local);
  s += arrow([[190, 159], [190, 192]]);
  s += diamond(190, 248, 150, 106, t.q);
  s += box(0, 400, 170, 76, t.done, { accent: true });
  s += box(210, 400, 170, 76, t.llm);
  s += arrow([[115, 248], [85, 248], [85, 397]], { color: C.wood }) + text(100, 240, t.yes, { size: 13, fill: C.wood, weight: 600, anchor: "middle" });
  s += arrow([[265, 248], [295, 248], [295, 397]]) + text(280, 240, t.no, { size: 13, fill: C.soft, weight: 600, anchor: "middle" });
  s += arrow([[285, 127], [362, 127], [362, 397]], { dashed: true });
  s += `<text transform="translate(374 262) rotate(90)" font-family="'Golos Text', sans-serif" font-size="12" fill="${C.muted}" text-anchor="middle">${esc(t.fail)}</text>`;
  return svg(W, H, s);
}

// ---------------------------------------------------------------- 6. thresholds
const thr = [[0.6, 70, 96.4], [0.7, 50.5, 95.4], [0.8, 27.5, 94.8], [0.9, 5, 94.0]];
const T6 = {
  en: { a: "Items answered locally", b: "Combined accuracy", x: "Minimum confidence to answer locally", loc: "Local model alone", llm: "LLM alone" },
  hr: { a: "Stavke odgovorene lokalno", b: "Ukupna točnost", x: "Minimalna pouzdanost za lokalni odgovor", loc: "Samo lokalni model", llm: "Samo LLM" },
};
function thresholds(lang, narrow) {
  const t = T6[lang];
  const W = narrow ? 380 : 760;
  const pw = narrow ? 380 : 350, ph = 220;
  const H = narrow ? 2 * ph + 110 : ph + 40;
  const panel = (ox, oy, title, draw) => text(ox, oy + 14, title, { size: 14, weight: 600 }) + draw(ox, oy + 36);
  const bands = (ox, x) => ox + 44 + (x + 0.5) * ((pw - 54) / 4);
  const axisX = (ox, by) => thr.map(([th], i) => text(bands(ox, i), by + 18, num(th, lang), { anchor: "middle", size: 12, fill: C.muted })).join("") +
    text(ox + 44 + (pw - 54) / 2, by + 40, t.x, { anchor: "middle", size: 12, fill: C.soft });
  const bars = (ox, oy) => {
    const by = oy + ph - 60, Y = (v) => by - (v / 100) * (ph - 70);
    let s = [0, 25, 50, 75, 100].map((v) => line(ox + 44, Y(v), ox + pw - 10, Y(v)) + text(ox + 36, Y(v) + 4, `${v}`, { anchor: "end", size: 12, fill: C.muted })).join("");
    thr.forEach(([, local], i) => {
      const cx = bands(ox, i), bw = 40;
      s += `<rect x="${cx - bw / 2}" y="${Y(local)}" width="${bw}" height="${by - Y(local)}" fill="${C.wood}" opacity="${i === 0 ? 1 : 0.55}"/>`;
      s += text(cx, Y(local) - 7, pct(local, lang, local % 1 ? 1 : 0), { anchor: "middle", size: 12.5, fill: i === 0 ? C.wood : C.soft, weight: i === 0 ? 600 : 400 });
    });
    return s + axisX(ox, by);
  };
  const acc = (ox, oy) => {
    const by = oy + ph - 60, Y = (v) => by - ((v - 92) / 6) * (ph - 70);
    let s = [92, 94, 96, 98].map((v) => line(ox + 44, Y(v), ox + pw - 10, Y(v)) + text(ox + 36, Y(v) + 4, `${v}`, { anchor: "end", size: 12, fill: C.muted })).join("");
    s += line(ox + 44, Y(94.4), ox + pw - 10, Y(94.4), C.soft, 1.2, "6 4") + text(ox + 50, Y(94.4) - 6, `${t.loc} ${pct(94.4, lang)}`, { size: 11.5, fill: C.soft });
    s += line(ox + 44, Y(93.7), ox + pw - 10, Y(93.7), C.muted, 1.2, "2 4") + text(ox + 50, Y(93.7) + 15, `${t.llm} ${pct(93.7, lang)}`, { size: 11.5, fill: C.muted });
    s += `<path d="${thr.map(([, , a], i) => `${i ? "L" : "M"}${bands(ox, i)},${Y(a)}`).join(" ")}" fill="none" stroke="${C.wood}" stroke-width="2.5"/>`;
    thr.forEach(([, , a], i) => {
      s += `<circle cx="${bands(ox, i)}" cy="${Y(a)}" r="4.5" fill="${C.wood}"/>`;
      // The last point sits between the two reference lines, so its label goes beside it.
      const last = i === thr.length - 1;
      s += text(bands(ox, i) + (last ? 9 : 0), last ? Y(a) + 4 : Y(a) - 10, pct(a, lang), { anchor: last ? "start" : "middle", size: 12.5, fill: C.wood, weight: i === 0 ? 600 : 400 });
    });
    return s + axisX(ox, by);
  };
  let s = panel(0, 0, t.a, bars);
  s += narrow ? panel(0, ph + 90, t.b, acc) : panel(410, 0, t.b, acc);
  return svg(W, H, s);
}

const figures = { architecture, "zero-shot": zeroShot, "speed-accuracy": scatter, "learning-curve": learning, cascade, thresholds };

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 800, height: 800 } });
const sizes = {};
for (const lang of ["en", "hr"]) {
  for (const [name, draw] of Object.entries(figures)) {
    for (const narrow of [false, true]) {
      const markup = draw(lang, narrow);
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&display=block" rel="stylesheet">
<style>html,body{margin:0;background:${C.bg}} body{padding:24px} svg{display:block;overflow:visible}</style></head>
<body><div id="f" style="display:inline-block;padding:24px;background:${C.bg}">${markup}</div></body></html>`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const png = await page.locator("#f").screenshot({ type: "png" });
      const file = `${name}-${lang}${narrow ? "-sm" : ""}.webp`;
      const info = await sharp(png).webp({ quality: 88 }).toFile(path.join(OUT, file));
      sizes[file] = `${info.width}x${info.height}`;
    }
  }
}
await browser.close();
console.log(sizes);
