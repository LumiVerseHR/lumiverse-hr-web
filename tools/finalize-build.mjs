// Normalise locale homepages in the build output.
//
// astro.config.mjs uses build.format "file", which turns src/pages/hr/index.html
// into dist/hr.html and leaves dist/hr/ holding only the other Croatian pages.
// That splits the tree in two and puts the homepage somewhere no nginx rule
// would look, so move it back to dist/<locale>/index.html.
import { existsSync, mkdirSync, renameSync } from "node:fs";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const locales = ["hr"];

const moved = [];
for (const locale of locales) {
  const from = path.join(dist, `${locale}.html`);
  if (!existsSync(from)) continue;
  const to = path.join(dist, locale, "index.html");
  mkdirSync(path.dirname(to), { recursive: true });
  renameSync(from, to);
  moved.push(`${locale}.html -> ${locale}/index.html`);
}

console.log(moved.length ? `Finalized build: ${moved.join(", ")}.` : "Finalized build: nothing to move.");
