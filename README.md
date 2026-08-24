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
npm run test:routes
npm run test:visual
```

`test:routes` and `test:visual` bind temporary localhost servers. In restricted
environments they may require permission to listen on `127.0.0.1`.

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

## Supporting files

```
src/pages/          Astro source pages generated from the legacy HTML
public/             Files copied verbatim into the built site root
styles.css          Legacy shared stylesheet copied into public/styles.css
partials/           Canonical shared nav, footer & capacity note (see Shared partials)
scripts/            sync_shared.py (shared-partial sync + drift check), indexnow.py
showcase.js         Hero-image slideshow with a WebGL mosaic transition
style-guide.md      Design system: colors, type scale, components
writing-guide.md    Voice, tone and copy conventions
images/             Screenshots and photography
sitemap.xml         Update when adding or reordering pages; priorities track homepage order
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

Blocks that must stay identical across pages live once in `partials/` and are
propagated by `scripts/sync_shared.py`:

- **`nav.html`** and **`footer.html`** — the top `<nav>` and `<footer>`, present
  on every content page (in "subpage" form, e.g. `index.html#work`). The
  homepage's legitimate variant — same-page anchors (`#work`) and a `/` logo — is
  derived automatically, so `index.html` stays in sync too. (required regions)
- **`capacity-note.html`** — the "studio at capacity for builds, products open"
  CTA box. Only the case-study pages that use it are checked/synced; pages
  without it are skipped, not flagged. (optional region)

Workflow:

- **Edit the partial, not the pages.** After changing a file in `partials/`, run
  `python3 scripts/sync_shared.py` to write the change into all pages that use it.
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
4. Add a `<url>` entry to `sitemap.xml` — priorities descend in homepage Work order,
   so reordering the cards means re-laddering the priorities too.
5. Put images in `images/`, keep them roughly 100–300 KB, and use **real product
   screenshots, not stock photography**. The homepage makes no external image requests;
   keep it that way.
6. For the hero image, prefer the **showcase slideshow** (below) over a single static
   screenshot.

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

## Stack

- Semantic HTML5 and hand-written CSS with custom properties — no CSS framework
- [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- Font Awesome 6 for icons
- A WebGL shader hero on the homepage, with a CSS mesh-gradient fallback and
  `prefers-reduced-motion` support
- Google Analytics (gtag)

## Deployment

Hosted as static files on a VPS. `./deploy.sh` builds the Astro site, runs parity
and route checks, rsyncs `dist/` to a git-SHA release directory, and switches the
`current` symlink.

```bash
DEPLOY_HOST=<ssh-alias> [DEPLOY_PATH=/var/www/lumiverse.hr] ./deploy.sh
```

Nginx should serve `/var/www/lumiverse.hr/current`; see
`nginx/lumiverse.hr.conf`. The canonical routes are extensionless:
`/rentalica`, `/titlomat`, etc. Requests for `/slug.html` and `/index.html`
redirect permanently to `/slug` and `/`.

## SEO notes

- Every page carries a `<link rel="canonical">` on the **www** host using the
  extensionless URL. The canonical host is `www.lumiverse.hr`; `lumiverse.hr`
  should 308-redirect to it. `404.html` is `noindex` instead. `sitemap.xml`
  and `robots.txt` use the same www host.
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
