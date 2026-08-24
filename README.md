# LumiVerse Website

The marketing site for **LumiVerse d.o.o.**, a human augmentation studio in Zagreb, Croatia.
Live at [lumiverse.hr](https://www.lumiverse.hr/).

Astro static site. The source is generated from the legacy HTML pages during
the migration phase, then built to plain static files in `dist/` for VPS hosting.

## Running locally

Install dependencies once:

```bash
npm install
```

Run the Astro dev server:

```bash
npm run dev
# then open the local URL Astro prints
```

Build and verify the production output:

```bash
npm run build
npm run test:parity
npm run test:i18n
npm run test:seo
npm run test:routes
npm run test:visual
```

`test:routes` and `test:visual` bind temporary localhost servers. In restricted
environments they may require permission to listen on `127.0.0.1`. `test:visual`
also needs ImageMagick (`magick`) on PATH.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Homepage — services, Titlomat product section, case studies, process, contact |
| `titlomat.html` | Product page — automatic Croatian and English YouTube subtitles |

Case studies, listed in the order they appear in the homepage **Work** section:

| File | Purpose |
|------|---------|
| `moj-kolega.html` | Moj Kolega — a managed AI employee (embeddable agent) for webshops: catalogue-grounded answers, recommendations, lead capture, escalation |
| `bridj.html` | AI marketing intelligence — tech-lead consulting engagement |
| `barcoder.html` | An encyclopedia of QR, barcode and visual-code standards |
| `aimito.html` | Comic-book apparel brand for developers, built around a content engine |
| `rentalica.html` | A decade-old PHP rent-a-car system rebuilt as a multi-tenant SaaS |
| `overserved.html` | A tower-defense game, as a test of how far AI-assisted development goes |
| `tvrtko.html` | Croatian business intelligence platform |
| `country-guides.html` | Multi-tenant travel-guide platform — nine branded country sites from one codebase, AI-written content |
| `army-adria.html` | BTS fan-community platform (magazine, archive, games, member accounts) - built by one non-developer in two weeks with AI |
| `pitaj-lider.html` | Business intelligence assistant |
| `lider-pdf-archive.html` | Magazine archive digitization |
| `lider-translations.html` | Multilingual publishing — a Croatian newsroom AI-translated into 10 languages across 11 live WordPress sites |

Research (its own homepage band + nav item, kept distinct from the Work grid):

| File | Purpose |
|------|---------|
| `air-laser.html` | Design study for an air-plasma aerial display, computed by an AI-agentic simulation station - the studio's own R&D |

| Other | Purpose |
|------|---------|
| `404.html` | Error page |
| `decks/tvrtko-agents.html` | Standalone presentation deck |

### Croatian (`/hr/`)

`hr/` holds a Croatian counterpart for every page above except `brand-guide.html`
and the deck, at the same slug: `/rentalica` ↔ `/hr/rentalica`, `/` ↔ `/hr/`.
See [Languages](#languages).

## Supporting files

```
hr/                 Croatian pages, one per English page (see Languages)
src/pages/          Astro source pages generated from the legacy HTML
public/             Files copied verbatim into the built site root
styles.css          Legacy shared stylesheet copied into public/styles.css
partials/           Canonical shared nav, mobile nav, footer & capacity note (see Shared partials)
partials/hr/        The same four partials in Croatian
scripts/            sync_shared.py (shared-partial sync + drift check), indexnow.py
showcase.js         Hero-image slideshow with a WebGL mosaic transition
style-guide.md      Design system: colors, type scale, components
writing-guide.md    Voice, tone and copy conventions
images/             Screenshots and photography
sitemap.xml         Update when adding or reordering pages; both trees, priorities track homepage order
robots.txt          Crawler rules
manifest.json       PWA manifest
nginx/              VPS routing, redirects, caching and security headers
humans.txt          Credits
security.txt        Security contact
favicon.*           Icon set (ico, svg, 192, 512, apple-touch)
```

## Conventions

**Read `style-guide.md` and `writing-guide.md` before adding or editing a page.**
They define the visual system and the copy voice, and the existing pages follow them closely.

- During the migration phase, edit the legacy root HTML/CSS/assets, then run
  `npm run migrate` or `npm run build` to regenerate `src/pages` and `public`.
- Shared styles live in `styles.css`. Page-specific styles go in a `<style>` block in
  that page's `<head>` — see `rentalica.html` or `titlomat.html`.
- Case study pages share a structure: breadcrumb, tag pill, title, CTAs, hero image
  showcase, stats bar, content sections, gradient CTA block, footer.
- Every page carries the same nav, mobile nav, footer, and the nav-scroll and
  mobile-toggle scripts. Copy an existing page rather than starting from scratch.

### Shared partials

Blocks that must stay identical across pages live once in `partials/` (English)
and `partials/hr/` (Croatian), and are propagated by `scripts/sync_shared.py`:

- **`nav.html`**, **`mobile-nav.html`** and **`footer.html`** — the top `<nav>`,
  the mobile overlay and the `<footer>`, present on every content page (in
  "subpage" form, e.g. `index.html#work`, or `/hr/#work` in Croatian). Each
  tree's homepage variant — same-page anchors (`#work`) and a root logo — is
  derived automatically, so the homepages stay in sync too. (required regions)
- **`capacity-note.html`** — the "studio at capacity for builds, products open"
  CTA box. Only the case-study pages that use it are checked/synced; pages
  without it are skipped, not flagged. (optional region)

The partials may contain **`{{alt_url}}`**, which `sync_shared.py` replaces per
page with that page's counterpart in the other language. That is what makes the
language switcher point at the equivalent page rather than the language home.

Workflow:

- **Edit the partial, not the pages.** After changing a file in `partials/`, run
  `python3 scripts/sync_shared.py` to write the change into all pages that use it.
  Croatian and English partials are separate files — a copy change usually needs both.
- **`python3 scripts/sync_shared.py --check`** verifies every page matches and
  exits non-zero on drift. It runs in `deploy.sh` and in the `.githooks/pre-commit`
  hook — enable the hook once per clone with `git config core.hooksPath .githooks`.
- `404.html` and `brand-guide.html` carry intentionally minimal chrome and are
  skipped for the required regions.

### Adding a case study

1. Copy an existing case study page as the starting point — `rentalica.html` and
   `aimito.html` are the most complete examples.
2. Add a `.project-card` to the Work section of `index.html`, and renumber the
   `<!-- Project N: … -->` comments.
3. Add the page to the footer **Work** list in `partials/footer.html`, then run
   `python3 scripts/sync_shared.py` to propagate it to every page (see
   [Shared partials](#shared-partials)).
4. Add a `<url>` entry to `sitemap.xml` for **both** the English and the Croatian
   URL — priorities descend in homepage Work order, so reordering the cards means
   re-laddering the priorities too.
5. Put images in `images/`, keep them roughly 100–300 KB, and use **real product
   screenshots, not stock photography**. The homepage makes no external image requests;
   keep it that way.
6. For the hero image, prefer the **showcase slideshow** (below) over a single static
   screenshot.
7. Create the Croatian counterpart — `node tools/scaffold-locale.mjs hr <page>.html`,
   then translate the copy and add the card and footer link to the Croatian tree.
   `npm run test:i18n` fails until it exists. See [Languages](#languages).

### The hero showcase

`showcase.js` turns a stack of `<img>` into a slideshow whose transition breaks the
frame into tiles that flip to the next image in a diagonal wave. Add
`<script src="showcase.js" defer></script>` to the page head and use:

```html
<div class="showcase" data-showcase data-interval="5200">
  <img class="showcase-slide" src="images/thing-1.jpg" alt="…">
  <img class="showcase-slide" loading="lazy" decoding="async" src="images/thing-2.jpg" alt="…">
  <img class="showcase-slide" loading="lazy" decoding="async" src="images/thing-3.jpg" alt="…">
</div>
```

- **Give every slide the same aspect ratio** (the set so far is 1440×900). Mismatches
  are cropped rather than stretched, but a consistent set looks better.
- Keep the first slide eager and lazy-load the rest, as above.
- Dots, arrows, arrow-keys and autoplay-pause-on-hover come for free. It degrades to a
  CSS crossfade without WebGL, to the first image without JS, and drops the animation
  entirely under `prefers-reduced-motion`.
- Two slides is the minimum; below that the script leaves the markup alone.

Two layout gotchas worth knowing:

- **`.bento-grid` is 3 columns and `.bento-card-lg` spans 2.** Make the card widths add
  up to a multiple of 3 or the last row ends up with a gap — e.g. 2 large + 5 regular.
- **Card images are cropped to a 300px-tall box with `object-fit: cover`.** Portrait
  source images need `object-position: top` (see the Lider Archive card) or the crop
  lands on a meaningless middle slice.

## Languages

English is the default and lives at the site root. Croatian is a full parallel
tree under `/hr/`, page for page, at the same slugs.

| | English | Croatian |
|---|---|---|
| Source | `*.html` | `hr/*.html` |
| Partials | `partials/` | `partials/hr/` |
| Homepage | `/` | `/hr/` |
| Case study | `/rentalica` | `/hr/rentalica` |

**Adding a page to the Croatian tree**

```bash
node tools/scaffold-locale.mjs hr rentalica.html   # or omit the file for all missing pages
python3 scripts/sync_shared.py                     # swap in the Croatian nav/footer
# then translate the copy in hr/rentalica.html
```

`scaffold-locale.mjs` copies the English page and fixes the mechanical parts:
`lang`, canonical, `og:url`, the `og:locale` pair, structured-data page URLs, and
the paths. It never overwrites an existing file, so it can't clobber a finished
translation. The copy is left in English deliberately — translating it is the
human step.

**Localised images.** Screenshots live in `images/` and are shared by both
trees. Where a product has its own Croatian UI, drop the Croatian capture in
`images/hr/<same-name>` and point the Croatian page at `/images/hr/<name>` —
that is what `hr/moj-kolega.html` does. Only worth it when the language is
actually visible *and* the product has that language: most screenshots are
either language-neutral or the language in them **is** the subject (the Lider
Translations sites, Country Guides, The Aimito). `npm run test:i18n` fails if a
page references an image that isn't there.

Captures are 1440×900 for showcase slides and 1200×533 for homepage cards,
JPEG, roughly 80–150 KB. Take them with Playwright at `deviceScaleFactor: 2`
and downscale, dismissing the target site's cookie bar first.

**Rules that the build enforces** (`npm run test:i18n`):

- **Croatian pages use root-absolute URLs** — `/styles.css`, `/images/x.jpg`,
  `/hr/rentalica`. A relative `styles.css` resolves to `/hr/styles.css` and 404s.
- **Every English page has a Croatian counterpart** at the same slug, and both
  carry reciprocal `hreflang` (`en`, `hr`, `x-default` → English) plus their own
  canonical, `og:url` and `og:locale`.
- **The language switcher points at the counterpart page**, not the language home
  — see `{{alt_url}}` under [Shared partials](#shared-partials).
- **Both trees are in `sitemap.xml`.**
- **Every referenced image exists**, so a locale override can't silently 404.
- **Bilingual products link the reader's language** — our own products default
  to Croatian at their root and serve English at `/en`, so the English tree
  links `/en` and the Croatian tree the bare domain.
- **Structured-data breadcrumbs are Croatian**, matching the visible ones.

`npm run test:seo` covers both trees: unique titles and descriptions within the
lengths a SERP actually renders, `og:`/`twitter:` restating those same strings,
one `<h1>`, a resolvable `og:image`, parseable JSON-LD, and the rule that an
indexable page is in `sitemap.xml` while a `noindex` page is not.

`brand-guide.html` (an internal design reference) and `decks/tvrtko-agents.html`
(a standalone deck) are English-only by design and carry no `hreflang`.

**Routing.** `/hr` redirects to `/hr/`, `/hr/<slug>.html` redirects to
`/hr/<slug>`, and a missing `/hr/…` URL serves the Croatian `404`. The rules live
in `deploy/dokploy/nginx.conf` (and the legacy `nginx/lumiverse.hr.conf`), and
`tools/test-routes.mjs` mirrors them so the behaviour is covered by a test.

**Build note.** Astro's `build.format: "file"` writes `src/pages/hr/index.html`
to `dist/hr.html`, which would leave the Croatian homepage where no nginx rule
looks for it. `tools/finalize-build.mjs` moves it to `dist/hr/index.html` after
`astro build`; it is part of `npm run build`.

## Stack

- Semantic HTML5 and hand-written CSS with custom properties — no CSS framework
- [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- Font Awesome 6 for icons
- A WebGL shader hero on the homepage, with a CSS mesh-gradient fallback and
  `prefers-reduced-motion` support
- Google Analytics (gtag)

## Deployment

Hosted as static files on a VPS. `./deploy.sh` builds the Astro site, runs the
parity, i18n and route checks, rsyncs `dist/` to a git-SHA release directory, and
switches the `current` symlink.

```bash
DEPLOY_HOST=<ssh-alias> [DEPLOY_PATH=/var/www/lumiverse.hr] ./deploy.sh
```

Nginx should serve `/var/www/lumiverse.hr/current`; see
`nginx/lumiverse.hr.conf`. The canonical routes are extensionless:
`/rentalica`, `/titlomat`, etc. Requests for `/slug.html` and `/index.html`
redirect permanently to `/slug` and `/`, and the same holds under `/hr/` — see
[Languages](#languages) for the Croatian rules.

The live deployment is Dokploy rather than rsync: it builds
`deploy/dokploy/Dockerfile` from `docker-compose.prod.yml`, and the container's
nginx config is `deploy/dokploy/nginx.conf`. Keep that file and
`nginx/lumiverse.hr.conf` in step when routing changes.

## SEO notes

- Every page carries a `<link rel="canonical">` on the **www** host using the
  extensionless URL. The canonical host is `www.lumiverse.hr`; `lumiverse.hr`
  should 308-redirect to it. Both `404.html` files are `noindex` instead.
  `sitemap.xml` and `robots.txt` use the same www host.
- English and Croatian pages cross-reference each other with `hreflang`;
  `x-default` points at English. Nothing auto-redirects by browser language —
  the nav switcher is the only way between the trees. See
  [Languages](#languages).
- **IndexNow** (fast re-crawl for Bing/Yandex/Seznam): the public key file
  `<key>.txt` lives at the site root, and `scripts/indexnow.py` submits the sitemap's
  page URLs. After a deploy that adds/changes pages, run `python3 scripts/indexnow.py`
  (the key file must be live first). The key is public by design — not a secret.

## Contact

- **Company:** LumiVerse d.o.o., Markuševečka cesta 20C, 10000 Zagreb, Croatia
- **Email:** [tihomir.jauk@lumiverse.hr](mailto:tihomir.jauk@lumiverse.hr)
- **Phone:** +385 95 911 99 47
- **VAT ID:** HR88595646800
- [LinkedIn](https://www.linkedin.com/company/lumiversehr) · [Book a call](https://calendly.com/tihomirjauk/30min)

---

© LumiVerse d.o.o. All rights reserved.
