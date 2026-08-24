import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

// Slugs shared by both language trees. The homepage is handled separately
// because its route is "/" in English and "/hr/" in Croatian.
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

// English-only pages: an internal design reference and a standalone deck.
const enOnly = ["brand-guide", "decks/tvrtko-agents"];

const enRoutes = ["/", ...slugs.map((slug) => `/${slug}`), ...enOnly.map((slug) => `/${slug}`)];
const hrRoutes = ["/hr/", ...slugs.map((slug) => `/hr/${slug}`)];
const routes = [...enRoutes, ...hrRoutes];

function resolveFile(url) {
  const clean = url.split("?")[0].split("#")[0];
  if (clean === "/") return path.join(dist, "index.html");
  if (clean === "/hr/") return path.join(dist, "hr", "index.html");
  const noSlash = clean.replace(/^\//, "");
  return path.join(dist, `${noSlash}.html`);
}

// Mirrors deploy/dokploy/nginx.conf: extensionless canonical URLs, /hr as the
// Croatian language root, and a Croatian 404 page under the /hr/ prefix.
const server = http.createServer((req, res) => {
  const url = req.url ?? "/";

  const redirect = (location) => {
    res.writeHead(308, { Location: location });
    res.end();
  };

  if (url === "/index.html") return redirect("/");
  if (url === "/hr") return redirect("/hr/");
  if (url === "/hr/index.html") return redirect("/hr/");

  const htmlRedirect = url.match(/^\/(.+)\.html([?#].*)?$/);
  if (htmlRedirect) return redirect(`/${htmlRedirect[1]}`);

  const file = resolveFile(url);
  if (!existsSync(file)) {
    const notFound = url.startsWith("/hr/")
      ? path.join(dist, "hr", "404.html")
      : path.join(dist, "404.html");
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(existsSync(notFound) ? readFileSync(notFound) : "not found");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(readFileSync(file));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

async function expectRedirect(from, to) {
  const res = await fetch(`${base}${from}`, { redirect: "manual" });
  if (res.status !== 308) throw new Error(`${from} returned ${res.status}, expected 308`);
  if (res.headers.get("location") !== to) {
    throw new Error(`${from} redirected to ${res.headers.get("location")}, expected ${to}`);
  }
}

try {
  for (const route of routes) {
    const res = await fetch(`${base}${route}`);
    if (res.status !== 200) throw new Error(`${route} returned ${res.status}`);
  }

  const redirects = [
    ["/index.html", "/"],
    ["/hr", "/hr/"],
    ["/hr/index.html", "/hr/"],
    ...routes
      .filter((route) => route !== "/" && route !== "/hr/")
      .map((route) => [`${route}.html`, route])
  ];

  for (const [from, to] of redirects) {
    await expectRedirect(from, to);
  }

  // A missing Croatian URL must render the Croatian error page, not the English one.
  const missing = await fetch(`${base}/hr/nema-ovoga`);
  if (missing.status !== 404) throw new Error(`/hr/nema-ovoga returned ${missing.status}, expected 404`);
  if (!(await missing.text()).includes('lang="hr"')) {
    throw new Error("/hr/nema-ovoga did not serve the Croatian 404 page");
  }

  console.log(
    `Route smoke passed for ${routes.length} extensionless route(s) ` +
      `(${enRoutes.length} en, ${hrRoutes.length} hr) and ${redirects.length} redirect(s).`
  );
} finally {
  server.close();
}
