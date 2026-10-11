# Site structure, Pricing split and Packages: plan (2026-10-10)

Scope: the v3 site (`site/`, branch `feat/design-v3`). Nothing below is built yet.

## 1. What's there now

- The main nav has 6 items, and 5 of them are anchors on the homepage (`/#work`, `/#services`, `/#research`, `/#studio`, `/#contact`). Only Pricing is a real page.
  - "Research" lands on the Air-laser card inside the Flagships section (`Flagships.tsx:20`), not on a research section.
  - From any other page, every nav click reloads the homepage and scrolls. On the homepage itself, the nav is just scrolling, so the visitor never feels they've moved anywhere.
- The homepage carries 8 sections after the hero: Flagships, Thesis, WorkIndex, Services, Notes, Studio, Contact (plus the hero). It works as a long tour, but nothing gets a URL of its own, a title or a meta description, and nothing ranks.
- Pricing renders 11 packages in 3 groups from `src/content/packages.mjs`:
  - engagement: prototype €490 fixed, build from €8,900/mo, tech lead from €4,500/mo
  - upskill: workshop from €1,900/day, rollout €4,900 + €900/mo
  - system: newsroom, multilingual publishing, knowledge assistant, archive digitisation, internal tool, legacy rebuild (setup + monthly fees)

  That's 11 cards, about 20 numbers and 4 billing models on one page. Most cards are "from" floors, so none of them is something you can actually order.
- Existing real pages: case studies (`/[slug]`, 15 of them), `/blog`, `/pricing`, and the landing pages `/tech-lead` and `/technical-founder`.

## 2. Proposed structure

```
Home        /             hero + one short teaser per area, each linking to its page
Work        /work         all case studies (Flagships + WorkIndex), filter by kind
Services    /services     how we work together: prototype, build, tech lead, workshops, rollout
Packages    /packages     fixed-scope, fixed-price services you can order (new)
              /packages/<id>   one page per package (SEO, preview, order)
Pricing     /pricing      ballpark numbers for custom work + how we price + FAQ
Research    /research     Air-laser + research notes (the "verifier is the moat" line)
Studio      /studio       who we are, principles, Zagreb, company details
Blog        /blog         unchanged
Contact     /contact      the form (also the destination of "Start a Project")
```

**Nav (desktop):** Work · Services · Packages · Pricing · Research · Studio, with Start a Project as the CTA.
- Blog goes in the footer, plus a homepage teaser (Notes). Contact is reached through the CTA, so it doesn't need a nav slot.
- That's 6 links, the same count as today, but every one is a real page.

**Homepage** gets shorter: the hero, then one short teaser band per area, each ending in a link:
- 3 flagship exhibits → "All work"
- the services strip → "How we work"
- 3 packages → "See packages"
- Thesis
- latest notes → "Blog"
- the contact CTA

The full sections move to their own pages, which reuse the existing components. That's a move, not a rewrite.

**Old anchors.** Links like `/#work` already exist in the wild (shared links, the legacy site, indexed URLs). A hash never reaches the server, so the homepage keeps a small client script that sends `#work`, `#services`, `#research`, `#studio` and `#contact` to the new pages. The teaser sections keep their ids, so nothing breaks before the script runs.

**SEO/plumbing for each new page:**
- metadata in EN and HR, plus hreflang
- sitemap entries
- JSON-LD:
  - `Service` + `Offer` for each package
  - `CollectionPage` for `/work`
- run `scripts/indexnow.py` after deploy
- the shared-region sync check (nav, footer) passes

## 3. Pricing vs Packages

The split comes from one question: **is the scope fixed before we talk?**

| | Pricing (custom work) | Packages (productised) |
|---|---|---|
| What | Engagements we scope with you | One defined deliverable |
| Price | Ballpark: "from" floors, ranges | One fixed price (or a fixed price per unit) |
| Scope | Agreed after a call | Written on the card: limits, revisions, delivery time |
| Action | "Start a Project" → call | "Order" → brief form (v1), checkout (later) |

**Pricing page after the split:**
- 3 ways to work with ballpark numbers:
  - **Prototype**, €490 fixed: stays here as the entry point and is also listed as a package.
  - **Product build**, from €8,900/mo.
  - **Embedded tech lead**, from €4,500/mo.
- **Custom AI systems.** The current "system" group (newsroom, multilingual, knowledge assistant, archive, internal tool, legacy rebuild) collapses into one row:
  - a typical range,
  - "setup + a small monthly running fee",
  - links to the relevant case studies.

  Each of those systems either becomes a package (section 4) or stays custom.
- **Team upskilling:** the workshop and rollout as a ballpark row. The workshop also appears as a package.
- **How we price:** fixed vs monthly, what's included, VAT, IP ownership. Then the FAQ.

The result is roughly 5 rows and 6 numbers instead of 11 cards.

**Data:**
- `packages.mjs` stays the single source of truth.
- Each entry gets `kind: "custom" | "package"`. Packages also get `delivery` (e.g. "5 working days"), `limits` (pages, seconds, revisions), `unit` (per video, per 1,000 pages) and an optional `preview`.
- `tools/test-pricing.mjs` extends to `/packages` and the detail pages, so every price is still written once and checked everywhere.

## 4. Package candidates, from what we've already built

Every candidate below reuses a pipeline we've shipped. The "proof" column is the case study or artefact that shows it. All prices are **blank on purpose**: you set them (MOTION/writing rules: no invented numbers).

| # | Package | What the client gets (draft scope) | Built from | Proof | Status |
|---|---|---|---|---|---|
| 1 | **Your web page as a TikTok / Reels video** | A 15–25s vertical video made from your live page: real screenshots, motion, music, captions. 1 revision. | lumi-motion pipeline, launch video (Sept 2026) | our launch video | Vertical format is "ASK ME" in MOTION.md: needs a spec and one example |
| 2 | **Business website, up to 20 pages** | Design + build on our Next.js stack, EN/HR, SEO basics, contact form, hosting setup. | this site's v3 stack | lumiverse.hr itself | Ready to scope; needs a page-count/revisions policy |
| 3 | **Real-estate project visualisation** | Stills (and a short laser-reveal animation) of a project from plans or a model, for the sales site. | Blender render + layered-reveal pipeline (hero) | laser-cut hero + blog post | **Example and preview still pending** (as you said) |
| 4 | **Animated 3D hero for your homepage** | Your product rendered in Blender, revealed by a canvas animation, no WebGL. | the laser-cut hero | homepage + blog post | Ready; needs a second example on a non-LumiVerse product |
| 5 | **YouTube subtitles in Croatian** | Your back catalogue subtitled, priced per hour of video. | Titlomat | titlomat case | Titlomat is self-serve: decide whether this package is "done-for-you" or just links out |
| 6 | **Translate your site into N languages** | Per-site setup plus per-article running cost, published to WordPress. | Lider translations | lider-translations | Today a €7,900 setup "system": could become a smaller fixed tier (e.g. 3 languages, 1 site) |
| 7 | **PDF archive → searchable archive** | OCR + search for up to N thousand pages, priced per 1,000 pages. | Lider PDF archive | lider-pdf-archive | Today €6,900 per project: unit pricing makes it orderable |
| 8 | **Chat assistant on your documents** | An assistant over up to N documents, embedded on your site, 1 month of tuning. | Pitaj Lider, Kolega | pitaj-lider | Today €4,900 setup: a fixed starter tier |
| 9 | **Webshop product descriptions** | Descriptions for N products in HR/EN from your catalogue feed. | Aimito | aimito | Check what the Aimito case actually claims before writing the copy |
| 10 | **AI webshop assistant, set up for you** | Moj Kolega installed, configured on your catalogue, tuned for 2 weeks. | Moj Kolega | moj-kolega | Product has its own site and pricing: link out, or add a setup fee only |
| 11 | **AI Prototype** (existing) | Unchanged, €490 fixed. | — | overserved | Ready: move/duplicate it |
| 12 | **AI Team Workshop** (existing) | One day, fixed. | — | air-laser | Ready: "from €1,900/day" needs to become a fixed price to be a package |

Not packaged (stay custom): the AI newsroom (mojkraj), custom internal tools (rentalica), legacy rebuilds, the tech lead, product builds, programmatic content sites (country-guides), and research work (air-laser).

**Suggested first wave:** 1, 2, 4, 11, 12. They're the clearest to scope, and we have proof for each on our own site. Package 3 goes up as soon as its example exists. Packages 6–8 get rewritten as smaller tiers after you confirm the numbers.

## 5. Ordering

- **v1:** the "Order" button opens the contact form with the package pre-selected, plus 2–3 questions specific to the package (e.g. the URL for the TikTok video, the page count for the website). We reply with a confirmation and an invoice. The current form and Brevo already do most of this.
- **v2 (later):** Stripe Checkout for packages with a truly fixed price. This needs terms of sale, a refund/revision policy, VAT handling (B2B reverse charge for the EU) and invoices from LumiVerse d.o.o. It's a separate decision, not part of this restructure.

## 6. Phases (each one shipped, verified and committed separately)

1. **Pages:**
   - Create `/work`, `/services`, `/research`, `/studio` and `/contact` from the existing sections, then trim the homepage to teasers.
   - Point the nav at the real pages and add the hash forwarder.
   - Update the sitemap, hreflang and metadata.
   - Verify: every nav link on every page, EN/HR, mobile, the old anchors, the sync check, and the build.
2. **Pricing split:**
   - Add `kind` and the new fields to `packages.mjs`, and rewrite `/pricing` as ballpark only.
   - Update the test-pricing check.
3. **Packages:**
   - Build the `/packages` index and the `/packages/<id>` detail pages with JSON-LD.
   - Add the v1 order flow, launching with the first-wave packages and your prices.
4. **New package content:**
   - Make an example/preview for each package that lacks one: TikTok video, real-estate visualisation, a second hero example.
   - Each package only goes live with its example.

## 7. Decisions needed from you

1. **Name:** "Packages" / "Paketi" (my suggestion), or "Packaged" as you wrote it?
2. **Prices** for every new package (section 4), and whether the workshop becomes a fixed price.
3. **Ordering:** v1 brief form now, with Stripe later?
4. **Own products** (Moj Kolega, Titlomat): list them as packages with a setup fee, or only link out?
5. **First wave:** OK with 1, 2, 4, 11, 12?

## Status (2026-10-10, evening)
- Decisions: "Packages / Paketi"; prices set by Claude as a first pass; ordering = contact form only;
  Moj Kolega listed with a setup fee; first wave approved.
- Done: phase 1 (pages, 5e44273), phases 2 + 3 (Pricing split, /packages + 6 package pages, order flow).
- First-wave prices: TikTok video €390, AI prototype €490, Moj Kolega setup €490, workshop €1,900/day
  (now fixed, up to 12 people), animated 3D hero €2,400, business website €3,900.
- Open: real-estate visualisation waits for its example. The TikTok package's preview is our 22s launch
  reel, which still shows the retired "We build Better Humans" slogan; a vertical example would be better.

## Status (2026-10-11)
- Prices now: TikTok video €250, AI prototype €490, Moj Kolega setup €490, animated 3D hero €999,
  business website €1,900 (1.5 weeks), premium website €4,900 (3 weeks, assumed). Workshop back to custom.
- Every package page shows "Previous work": silent loops recorded from the live sites with a CDP
  screencast (site/public/packages/evidence, 0.3-1.8 MB each), each linked to its case study.
  Cards on /packages show the first wide clip's poster.
  - web-to-video: ARMY Adria 9:16 news teaser + our launch reel
  - ai-prototype: Overserved gameplay, Barcoder, Rentalica
  - moj-kolega-setup: the live widget answering a question on mojkolega.hr
  - animated-hero: our homepage hero
  - business-website: Titlomat.com, Croatian Guide, MOJ KRAJ.
  - premium-website: homepage hero, overserved.lumiverse.hr, launch reel
- Open: the ARMY Adria teaser uses BANGTANTV photos (credited in frame); the launch reel still ends on
  the retired "We build Better Humans" slogan.
