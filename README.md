# LumiVerse Website

The marketing site for **LumiVerse d.o.o.**, a human augmentation studio in Zagreb, Croatia.
Live at [lumiverse.hr](https://www.lumiverse.hr/).

Static HTML and CSS — no build step, no framework, nothing to install.

## Running locally

Any static file server works. From the repository root:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Note that `.htaccess` rules do not apply locally, so redirects and caching headers
behave differently than in production.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Homepage — services, Titlomat product section, case studies, process, contact |
| `titlomat.html` | Product page — automatic Croatian and English YouTube subtitles |

Case studies, listed in the order they appear in the homepage **Work** section:

| File | Purpose |
|------|---------|
| `bridj.html` | AI marketing intelligence — tech-lead consulting engagement |
| `barcoder.html` | An encyclopedia of QR, barcode and visual-code standards |
| `aimito.html` | Comic-book apparel brand for developers, built around a content engine |
| `rentalica.html` | A decade-old PHP rent-a-car system rebuilt as a multi-tenant SaaS |
| `overserved.html` | A tower-defense game, as a test of how far AI-assisted development goes |
| `tvrtko.html` | Croatian business intelligence platform |
| `pitaj-lider.html` | Business intelligence assistant |
| `lider-pdf-archive.html` | Magazine archive digitization |

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
styles.css          Shared stylesheet — every page links to this
showcase.js         Hero-image slideshow with a WebGL mosaic transition
style-guide.md      Design system: colors, type scale, components
writing-guide.md    Voice, tone and copy conventions
images/             Screenshots and photography
sitemap.xml         Update when adding or reordering pages; priorities track homepage order
robots.txt          Crawler rules
manifest.json       PWA manifest
.htaccess           Apache rewrite, caching and security headers
humans.txt          Credits
security.txt        Security contact
favicon.*           Icon set (ico, svg, 192, 512, apple-touch)
```

## Conventions

**Read `style-guide.md` and `writing-guide.md` before adding or editing a page.**
They define the visual system and the copy voice, and the existing pages follow them closely.

- Shared styles live in `styles.css`. Page-specific styles go in a `<style>` block in
  that page's `<head>` — see `rentalica.html` or `titlomat.html`.
- Case study pages share a structure: breadcrumb, tag pill, title, CTAs, hero image
  showcase, stats bar, content sections, gradient CTA block, footer.
- Every page carries the same nav, mobile nav, footer, and the nav-scroll and
  mobile-toggle scripts. Copy an existing page rather than starting from scratch.

### Adding a case study

1. Copy an existing case study page as the starting point — `rentalica.html` and
   `aimito.html` are the most complete examples.
2. Add a `.project-card` to the Work section of `index.html`, and renumber the
   `<!-- Project N: … -->` comments.
3. Add the page to the footer **Work** list on *every* page (it is duplicated in each).
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

Hosted on **Vercel** with GitHub integration. Pushing to `main` deploys automatically —
there is no separate deploy step or script.

## SEO notes

- Every page carries a `<link rel="canonical">` on the **www** host (the canonical
  host — `lumiverse.hr` 308-redirects to `www.lumiverse.hr`). `404.html` is `noindex`
  instead. `sitemap.xml` and `robots.txt` use the same www host.
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
