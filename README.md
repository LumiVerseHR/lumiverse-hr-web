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
| `rentalica.html` | Case study — legacy PHP rewrite into a multi-tenant SaaS |
| `barcoder.html` | Case study — encyclopedia of QR, barcode and visual-code standards |
| `titlomat.html` | Product page — automatic Croatian and English YouTube subtitles |
| `tvrtko.html` | Case study — Croatian business intelligence platform |
| `bridj.html` | Case study — AI marketing intelligence, tech-lead consulting |
| `pitaj-lider.html` | Case study — business intelligence assistant |
| `lider-pdf-archive.html` | Case study — magazine archive digitization |
| `404.html` | Error page |
| `decks/tvrtko-agents.html` | Standalone presentation deck |

## Supporting files

```
styles.css          Shared stylesheet — every page links to this
style-guide.md      Design system: colors, type scale, components
writing-guide.md    Voice, tone and copy conventions
images/             Screenshots and photography
sitemap.xml         Update when adding a page
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

1. Copy an existing case study page as the starting point.
2. Add a `.project-card` to the Work section of `index.html`.
3. Add the page to the footer **Work** list on *every* page.
4. Add a `<url>` entry to `sitemap.xml`.
5. Put images in `images/` and keep them reasonably sized (roughly 100–300 KB).

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

## Contact

- **Company:** LumiVerse d.o.o., Markuševečka cesta 20C, 10000 Zagreb, Croatia
- **Email:** [tihomir.jauk@lumiverse.hr](mailto:tihomir.jauk@lumiverse.hr)
- **Phone:** +385 95 911 99 47
- **VAT ID:** HR88595646800
- [LinkedIn](https://www.linkedin.com/company/lumiversehr) · [Book a call](https://calendly.com/tihomirjauk/30min)

---

© LumiVerse d.o.o. All rights reserved.
