// Images for the post "From Blueprint to Archviz Renders in Headless Blender".
// Source renders live in the sibling project ../blender-house (renders/ and viewer/screenshots/).
// Before/after pairs are two 3:2 frames side by side, so the caption can say "left" and "right"
// and the image needs no text of its own in either language.
//
//   node design-src/blog-figures/blueprint-to-archviz.mjs  ->  public/blog/blueprint-to-archviz/*.webp + public/og/blueprint-to-archviz.jpg
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.resolve(ROOT, "../../blender-house");
const OUT = path.join(ROOT, "public/blog/blueprint-to-archviz");
mkdirSync(OUT, { recursive: true });
const src = (p) => path.join(SRC, p);

const W = 1520;
const single = (from, name) => sharp(src(from)).resize({ width: W }).webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`));

async function pair(left, right, name) {
  const half = (W - 8) / 2, h = Math.round(half / 1.5);
  const frame = (p) => sharp(src(p)).resize(half, h, { fit: "cover", position: "centre" }).toBuffer();
  const [a, b] = await Promise.all([frame(left), frame(right)]);
  return sharp({ create: { width: W, height: h, channels: 3, background: "#0c0c10" } })
    .composite([{ input: a, left: 0, top: 0 }, { input: b, left: half + 8, top: 0 }])
    .webp({ quality: 82 })
    .toFile(path.join(OUT, `${name}.webp`));
}

const jobs = [
  single("renders/11-finals/A-final.png", "cover"),
  pair("renders/00-baseline/house-3quarter.png", "renders/11-finals/A-final.png", "massing-to-final"),
  pair("renders/04-shot-tests/C-interior-living-test.png", "renders/11-finals/C3-final.png", "interior-light"),
  pair("renders/04-shot-tests/D-bedroom-test.png", "renders/11-finals/D-final.png", "bedroom-cloth"),
  pair("renders/04-shot-tests/B-bluehour-test.png", "renders/11-finals/B-final.png", "blue-hour"),
  single("renders/final-cutaways.jpg", "cutaways"),
  single("renders/tree-cards-raw.png", "tree-cards"),
  single("viewer/screenshots/test-hero.png", "viewer"),
  sharp(src("renders/11-finals/A-final.png")).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, "public/og/blueprint-to-archviz.jpg")),
];
for (const r of await Promise.all(jobs)) console.log(r.width, r.height, Math.round(r.size / 1024) + " KB");
