import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const dist = path.join(root, "dist");
const routes = ["/", "/rentalica", "/titlomat", "/country-guides", "/hr/", "/hr/rentalica"];
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 900 }
];

function contentType(file) {
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".ico")) return "image/x-icon";
  return "text/html; charset=utf-8";
}

function makeServer(baseDir, cleanUrls) {
  return createServer((req, res) => {
    const rawUrl = req.url ?? "/";
    const url = decodeURIComponent(rawUrl.split("?")[0].split("#")[0]);
    const candidates = [];

    if (url.endsWith("/")) candidates.push(path.join(baseDir, url, "index.html"));
    else {
      const clean = url.replace(/^\//, "");
      candidates.push(path.join(baseDir, clean));
      if (cleanUrls && !path.extname(clean)) candidates.push(path.join(baseDir, `${clean}.html`));
    }

    const file = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    if (!file) {
      res.writeHead(404);
      res.end("not found");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType(file) });
    res.end(readFileSync(file));
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

// ImageMagick 7 exposes `magick compare`; 6 ships `compare` as its own binary,
// which is what Debian and Ubuntu still package. Pick whichever is present.
//
// Comparing exits non-zero whenever the images differ, so a failure to run it
// at all looks the same as a difference. Resolve the binary up front, or a
// machine without ImageMagick reports every route as RMSE 1.0 and hides the
// real result.
function resolveCompare() {
  for (const [cmd, prefix] of [["magick", ["compare"]], ["compare", []]]) {
    try {
      execFileSync(cmd, [...prefix, "-version"], { stdio: "ignore" });
      return { cmd, prefix };
    } catch {}
  }
  return null;
}

const compare = resolveCompare();
if (!compare) {
  console.error("Visual parity needs ImageMagick on PATH (`magick` or `compare`). Install it and re-run.");
  process.exit(2);
}

const original = makeServer(root, true);
const migrated = makeServer(dist, true);
const originalPort = await listen(original);
const migratedPort = await listen(migrated);

const browser = await chromium.launch();
const failures = [];
const artifactDir = path.join(root, ".tmp", "visual-parity");
mkdirSync(artifactDir, { recursive: true });
const maxRmse = 0.005;
const freezeCss = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    scroll-behavior: auto !important;
  }
  canvas { visibility: hidden !important; }
`;

async function screenshot(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: freezeCss });
  return page.screenshot({ fullPage: true });
}

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (!url.startsWith("http://127.0.0.1:")) return route.abort();
      return route.continue();
    });

    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          scroll-behavior: auto !important;
        }
        canvas { visibility: hidden !important; }
      `
    });

    for (const route of routes) {
      const originalUrl = `http://127.0.0.1:${originalPort}${route}`;
      const migratedUrl = `http://127.0.0.1:${migratedPort}${route}`;

      const originalShot = await screenshot(page, originalUrl);
      const migratedShot = await screenshot(page, migratedUrl);
      const label = `${viewport.name}-${route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-")}`;
      const originalPath = path.join(artifactDir, `${label}-original.png`);
      const migratedPath = path.join(artifactDir, `${label}-migrated.png`);
      writeFileSync(originalPath, originalShot);
      writeFileSync(migratedPath, migratedShot);

      try {
        execFileSync(compare.cmd, [...compare.prefix, "-metric", "RMSE", originalPath, migratedPath, "null:"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"]
        });
      } catch (error) {
        const metric = `${error.stderr ?? ""}${error.stdout ?? ""}`;
        const match = metric.match(/\(([^)]+)\)/);
        if (!match) {
          failures.push(`${viewport.name} ${route} could not be compared: ${metric.trim() || error.message}`);
          continue;
        }
        const normalized = Number(match[1]);
        if (normalized > maxRmse) {
          failures.push(`${viewport.name} ${route} RMSE ${normalized.toFixed(5)}`);
        }
      }
    }

    await page.close();
  }
} finally {
  await browser.close();
  original.close();
  migrated.close();
}

if (failures.length) {
  console.error(`Visual parity differed for: ${failures.join(", ")}. Screenshots saved in ${artifactDir}`);
  process.exit(1);
}

console.log(`Visual parity passed for ${routes.length} route(s) across ${viewports.length} viewport(s).`);
