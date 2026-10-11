# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) in `site/`, a design-v3 rewrite replacing the legacy static HTML + Astro wrapper at the repo root, which keeps serving production until cutover. Real-time 3D with React Three Fiber (three.js + drei). Runs as a Node server in Docker on the existing Dokploy VPS, with the nginx edge (redirects, caching, security headers) kept. Server features are allowed: server actions (contact form), ISR, generated OG images. Real-time 3D elements are planned and are a reason for the switch. Bilingual EN and HR at matching slugs (`/x` ↔ `/hr/x`) must survive the move.

## Users

- **Primary (homepage):** high-end clients choosing an agency for high-impact AI work. They're senior decision-makers comparing studios and want to see that the team can be trusted with something ambitious and visible.
- **Secondary (each with its own landing page, not the homepage):**
  - Croatian SMEs buying fixed-price packages (prototype, workshop, packaged systems), priced in EUR from `src/pricing/packages.mjs`.
  - Teams hiring an embedded tech lead: architecture, reviews, release sign-off.
  - Founders looking for a technical founder or technical co-founder.
  - Further audiences may get pages later; the homepage stays aimed at the high-end client.

## Product Purpose

LumiVerse d.o.o. is a founder-led AI product studio in Zagreb, led by Tihomir Jauk. It does two things: it builds its own AI products, and it embeds with client teams to build theirs. Success on the site means a qualified high-end lead starts a conversation, and each secondary audience finds the offer meant for them.

## Positioning

Three claims, layered and ranked:

1. **Judgement over generation (the thesis).** "Generation is cheap. Judgement isn't." LumiVerse builds the verifiers, checks and human sign-off that make AI output safe to ship. The moat is the verifier, not the generator.
2. **Senior range, shipped (the proof).** A small senior team that has shipped across very different domains: newsrooms, SaaS rebuilds, physics R&D, games, BI, commerce.
3. **Builders who own products (the credibility).** Titlomat, Tvrtko.ai and Moj Kolega run in production with real users, so client work is built the way owners build.

Primary slogan: **"Human Imagination. AI Speed."** (HR: **"Ljudska mašta. AI brzina."**), chosen 2026-10-10. It replaces "We build Better Humans.", which is retired.

## Operating Context

Visitors evaluate the studio by reading case studies, looking at real product screenshots, checking prices (for the SME audience) and contacting through the site form (delivered via Brevo) or by email. The studio also publishes a blog of engineering notes (Markdown, English first) and an independent research band (air-laser).

## Capabilities and Constraints

- Services: AI Prototype, Custom AI Product Build, Embedded Tech Lead, AI Team Workshop and Rollout, and packaged systems (knowledge assistant, archive digitisation, multilingual publishing, legacy rebuild, AI newsroom, custom internal tool). Prices live in `src/pricing/packages.mjs`, and the current figures are placeholders.
- Every page exists in English and Croatian.
- Research is kept separate from client Work.
- Unlisted pages (decks, `v/` reels) stay noindex.
- SEO assets (sitemap, hreflang, canonicals, RSS, IndexNow) must carry over.

## Brand Commitments

- Name: LumiVerse. Products: Titlomat, Tvrtko.ai, Moj Kolega, Pazi.ai.
- Voice from `writing-guide.md`: active, direct, specific, numbers over adjectives, no hype, no "streamline your workflow" copy.
- No generic AI-SaaS imagery: glowing brains, robots, circuit boards.
- Visual system: under review for v3. MOTION.md and style-guide.md describe the incumbent look, not a binding one.

## Evidence on Hand

- **Homepage flagships:** Moj Kolega (`moj-kolega.html`, `images/mojkolega-*`), Bridj (`bridj.html`, `images/bridj-*`) and the air-laser research (`air-laser.html`, `images/airlaser-*`).
- **Other case studies:** Lider Translations (about 1.4M articles, 10 languages, 11 sites), Barcoder (463 standards, 197 countries, 1,076 wallets), The Aimito (889 designs), Rentalica, MOJ KRAJ., Overserved (7 worlds, 140 levels, 605 assets), ARMY Adria, Country Guides (14 sites), Tvrtko.ai (200,000+ companies), Pitaj Lider, Lider Digital Archive (50,000+ articles). Screenshots are in `images/`.
- **Products:** Titlomat (`titlomat.html`), Tvrtko.ai, Moj Kolega.
- **Blog posts:** `src/content/blog/en/`.
- **Absent, and must not be invented:** testimonials, client logos, awards, press, team size beyond the founder, and any number not traceable to the repo or a live case study.

## Product Principles

1. Lead with proof: real screenshots and real numbers come before any claim.
2. Judgement is visible: every claim of AI capability says what checked it and what still needs a human.
3. One door per audience: the homepage sells ambition, and each landing page speaks to one buyer.
4. Nothing fabricated: if it isn't in the repo or live, it isn't on the page.
