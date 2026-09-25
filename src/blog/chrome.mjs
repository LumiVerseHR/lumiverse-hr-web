// The shared nav, mobile nav, footer and consent strip for the blog pages,
// read from the same partials/ that scripts/sync_shared.py writes into the
// hand-written pages. One source of truth: change a partial and the blog
// follows on the next build, with no sync step and nothing to drift.
import { readFileSync } from "node:fs";
import path from "node:path";

const partialDirs = { en: "partials", hr: "partials/hr" };

// The English partials use page-relative links (index.html#work,
// rentalica.html) because they sit in root-level pages. Under /blog/ those
// would resolve to /blog/rentalica.html, so make every one root-absolute and
// extensionless — the same form the migrate step gives the other pages.
function absolutize(html) {
  return html.replace(/(href|src)="([^"]+)"/g, (full, attr, value) => {
    if (/^(?:[a-z]+:|\/|#|\{\{)/i.test(value)) return full;
    const [, file, suffix = ""] = value.match(/^([^?#]*)(.*)$/);
    const slug = file.replace(/\.html$/, "");
    const route = slug === "index" || slug === "" ? "/" : `/${slug}`;
    return `${attr}="${route}${suffix}"`;
  });
}

function partial(lang, name) {
  return absolutize(readFileSync(path.join(process.cwd(), partialDirs[lang], `${name}.html`), "utf8"));
}

// altUrl is where the language switcher goes: the translated post when there
// is one, otherwise the other language's blog index.
export function chrome(lang, altUrl) {
  const fill = (html) => html.replaceAll("{{alt_url}}", altUrl);
  return {
    nav: fill(partial(lang, "nav")),
    mobileNav: fill(partial(lang, "mobile-nav")),
    footer: fill(partial(lang, "footer")),
    consent: fill(partial(lang, "consent"))
  };
}
