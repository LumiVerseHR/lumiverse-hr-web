import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const routes = [
  "/",
  "/titlomat",
  "/air-laser",
  "/moj-kolega",
  "/bridj",
  "/barcoder",
  "/aimito",
  "/rentalica",
  "/mojkraj",
  "/overserved",
  "/tvrtko",
  "/country-guides",
  "/army-adria",
  "/pitaj-lider",
  "/lider-pdf-archive",
  "/lider-translations",
  "/brand-guide",
  "/decks/tvrtko-agents"
];

function resolveFile(url) {
  const clean = url.split("?")[0].split("#")[0];
  if (clean === "/") return path.join(dist, "index.html");
  const noSlash = clean.replace(/^\//, "");
  return path.join(dist, `${noSlash}.html`);
}

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";

  if (url === "/index.html") {
    res.writeHead(308, { Location: "/" });
    res.end();
    return;
  }

  const htmlRedirect = url.match(/^\/(.+)\.html([?#].*)?$/);
  if (htmlRedirect) {
    res.writeHead(308, { Location: `/${htmlRedirect[1]}` });
    res.end();
    return;
  }

  const file = resolveFile(url);
  if (!existsSync(file)) {
    res.writeHead(404);
    res.end("not found");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(readFileSync(file));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

try {
  for (const route of routes) {
    const res = await fetch(`${base}${route}`);
    if (res.status !== 200) throw new Error(`${route} returned ${res.status}`);
  }

  for (const route of routes.filter((route) => route !== "/")) {
    const res = await fetch(`${base}${route}.html`, { redirect: "manual" });
    if (res.status !== 308) throw new Error(`${route}.html returned ${res.status}, expected 308`);
    if (res.headers.get("location") !== route) {
      throw new Error(`${route}.html redirected to ${res.headers.get("location")}, expected ${route}`);
    }
  }

  const index = await fetch(`${base}/index.html`, { redirect: "manual" });
  if (index.status !== 308 || index.headers.get("location") !== "/") {
    throw new Error(`/index.html redirect failed`);
  }

  console.log(`Route smoke passed for ${routes.length} extensionless route(s) and ${routes.length} redirect(s).`);
} finally {
  server.close();
}
