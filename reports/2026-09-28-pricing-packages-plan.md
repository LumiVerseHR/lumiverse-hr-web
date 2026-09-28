# Pricing & packaged services: Kodeful teardown and a proposal for lumiverse.hr

Branch: `feat/pricing-packages` · Research date: 2026-09-28 · Sources: every public page on kodeful.com
(home, /services, /services/build|operate|partner, /pricing, /case-studies, one case study, /about, /contact),
fetched raw, not summarised.

---

## 1. What Kodeful actually does

### Offer architecture

Three named tracks, each with its own page built from one template, plus a pricing page that puts
a floor under each one.

| Track | What it is | Price on the page | Entry point |
|---|---|---|---|
| **Build** | Custom software / AI SaaS, prototype to production | Prototype **$497 one-time** (credited into the build) · Build **from $7,200/month** | $497 prototype |
| **Operate** | AI agents deployed into a client's workflows, then run and tuned monthly | **$14,500 setup** + **from $3,000/month** | Free "AI-Readiness Audit" |
| **Partner** | They fund the build, take a revenue share; client keeps IP | **$0 upfront**, terms per deal | "Fit call", scarcity: "2 slots in Q3" |

### The pricing page, section by section
1. H1 "Engagements built around your business".
2. Three cards (Prototype / Build / Operate): price, one-line "for whom", five inclusions, CTA.
3. FAQ, five questions, all about **how** they price, not what they build:
   - *Why "from $X"?* A real floor, so you know where the number starts; final price by scope and value, not hours.
   - *Do you bill hourly?* No. A fixed number up front, or a flat monthly rate. "No timesheets, no surprise overages."
   - *Do you discount?* No. "If budget is tight, we scope down rather than cut quality."
   - *What are the starting prices?* Repeats the numbers (good for search snippets).
   - *How does Partner pricing work?* Revenue share, 100% IP, terms set together.
4. Three named testimonials (the same three appear on home, services and pricing).
5. CTA: "Book a free audit … Book a discovery call".

### The service-page template (identical across Build / Operate / Partner)
Overview → What's included (4) → Process (4 numbered steps) → Deliverables / use cases →
Who it's for (3 personas) → FAQ (5) → CTA.

"Use cases" appear only on Operate, as a four-line list: support & inbox triage; lead research
and outreach; data entry and reporting; "any repetitive, rules-based workflow". There are no
use-case pages. "Who it's for" does the segmentation instead (Build: domain experts, founder-led
B2B, stalled product teams; Operate: high-volume teams, lean operators, AI-ready systems;
Partner: industry insiders, commercial operators, high-conviction ideas).

### The mechanics worth stealing
1. **Floors, not quotes.** "From $X" filters out mismatched buyers before the first call and sets the anchor.
2. **A cheap first step that gets credited.** The $497 prototype is a qualified-lead machine: low risk
   for the buyer, it produces the fixed quote, and the fee rolls into the build, so saying yes is easy.
3. **Setup + retainer.** Operate turns a project into recurring revenue ("run and optimize from $3,000/mo").
4. **Concrete scarcity.** "2 slots in Q3" beats "limited availability", and it is honest if it's true.
5. **Pricing FAQ as objection handling.** Hourly, discounts and "why from" are answered before anyone asks.
6. **Ownership repeated everywhere.** "100% of code and IP in your repository" appears on almost every page.
7. **One primary CTA** across the whole site (book a call / free audit).
8. **Proof numbers in the hero:** $4.2M annual product revenue, 120+ products, 5.0 on Clutch.

### What not to copy: their mistakes are our opening
Our brand is "the moat is the verifier", so a sloppy pricing page would contradict the pitch. Kodeful's has these faults:
- **Copy-pasted FAQs that are wrong for their page.** The Operate and Partner FAQs answer "What does
  Kodeful deliver?" with "a complete working product … we ship code" and "We start with a Scoping
  Sprint", which is the Build process. The Partner FAQ also says "fixed quote".
- **Boilerplate repeated twelve times.** Every process step on every page ends with the identical sentence
  "Every step is documented, reviewed with the owner, and carried into the next phase without a handoff gap."
- **Mislabelled steps.** "Launch" is tagged *Build*; "Handover" is tagged *Launch*.
- **A contradiction in the headline offer.** Build is "a fixed price, agreed before we start" and also
  "from $7,200/**month**", which is time-based.
- **A CTA that doesn't fit its page.** "Book a free audit" is Operate's entry point, yet it's the CTA on Build and Partner pages too.
- **No structured data at all.** There's no `FAQPage`, `Service` or `Offer` JSON-LD, so the FAQ and prices
  get no rich results.
- **Thin proof.** Four case studies, one of them their own product. The "120+ products" claim can't be checked.
- **™ on generic words** (BUILD™, OPERATE™, PARTNER™) reads as insecurity, not brand.

---

## 2. Where lumiverse.hr stands today

| | Kodeful | LumiVerse today |
|---|---|---|
| Services | 3 named tracks, each with a page | 4 generic cards on the homepage ("Product Development", "AI Strategy", "Tech Consulting", "Process Automation"); two have no detail, none has a page |
| Prices | Floors on every track | None anywhere on the site |
| Entry step | $497 prototype / free audit | "Start a Project" goes to email |
| Proof | 4 case studies, 3 testimonials, Clutch | **15 case studies with measured numbers**, 4 live own products, a research band, a blog. **No testimonials.** |
| Availability | "2 slots in Q3" | **"At capacity for new build work"** in the contact section, while the products are open |
| Process | Per-track 4-step process | One generic 4-step process (Discovery / Design / Build / Deploy) on the homepage |
| FAQ | On every page | None |

Our proof is much deeper than theirs. What we lack is **packaging**: a visitor can't tell what they
would buy, what it costs, or whether we're even taking work.

**The big tension:** pricing only makes sense if something can be bought. The site currently says
we're at capacity for builds. That makes the capacity answer (section 5, decision 1) the first decision.

---

## 3. Proposal: four packages on the proof we already have

Plain names, no ™. Each package is backed by case studies whose numbers are already on the site, so
nothing needs inventing (MOTION.md rule 2).

### ① Proof Sprint: "Find out if AI works on your problem before you pay for a build"
- **What:** 1–2 weeks. We take a sample of your real data (tickets, documents, audio, catalogue),
  build a working prototype **and the check that grades it**, and hand back a measured verdict:
  what works, what doesn't, what a build would cost. Fixed quote included; the fee is credited into Build.
- **Why it's ours:** it's the verifier thesis turned into a product. "We measured before we built
  anything" (the Titlomat post); a judge that caught what the model missed (the Moj Kolega and MOJ KRAJ posts).
  We say out loud that we'll tell you when AI *won't* help. Kodeful's audit never says that.
- **Proof:** Titlomat's WER baseline, Moj Kolega's judge, air-laser (3 days for the bulk of the work,
  every number checked).
- **Replaces:** "AI Strategy" and Kodeful's $497 prototype. It's paid, not free, because we're
  capacity-constrained and a paid sprint filters for serious buyers.

### ② Build: "A production AI product, fixed price per milestone"
- **What:** scope → milestones with fixed prices → production in the client's accounts → handover
  with tests and docs. 100% code and IP to the client.
- **Pricing shape:** a **fixed price per milestone**, stated "from €X per project". Don't copy Kodeful's
  "fixed … per month" contradiction.
- **Proof:** Rentalica (10+ years of data migrated, 0 password resets, 102 tests), Country Guides
  (12 sites, one codebase), Lider Translations (~1.4M articles, 10 languages), Overserved
  (3 weeks, empty repo to 140 levels), Titlomat and Tvrtko.ai (our own, live).
- **Replaces:** "Product Development".

### ③ Operate: "AI that runs every day and is checked every day"
- **What:** setup, then a monthly retainer. We deploy agents or pipelines into the client's tools, and **every
  output passes automated checks**. A monthly report says what ran, what the checks caught and what we
  tuned. The verifier becomes the line item, which is our angle over Kodeful's "monitoring and tuning".
- **Productised flagship:** **Moj Kolega** (webshops; its monthly improvement cycle already exists). A
  custom Operate engagement is the same thing for other workflows.
- **Proof:** Moj Kolega (24/7, 5 languages, monthly tuning), MOJ KRAJ (9 automated checks per article,
  1 operator, minutes a day), Lider Translations (refreshed daily), Lider PDF Archive (50K+ articles).
- **Replaces:** "Process Automation".

### ④ Embedded Tech Lead: "A senior tech lead inside your team, monthly"
- **What:** fractional CTO or tech lead: architecture, code review, release sign-off, hands-on when it
  counts. A monthly rate for N days per week, with a minimum term.
- **Proof:** Bridj (1 yr+, 17 services, 7 integrations, 4 production agents, release sign-off).
- **Replaces:** "Tech Consulting". Kodeful has no equivalent, which differentiates us. It's also the most
  capacity-bound package, so show it as **"1 seat · next opening: <month>"**.

### Also on the pricing page: products you can start today
A second, smaller row for self-serve and managed products, linking out. This resolves the "at capacity,
but the products are open" message the contact section already carries:
- **Titlomat**: public pricing already exists (credits from €5; Creator €19/month).
- **Moj Kolega**: managed; price "from €X/month" or "on request" (not public on mojkolega.hr today).
- **Tvrtko.ai**: link to its own plans.

### Partner / venture track: not now
Kodeful's revenue-share track suits a funded team with spare capacity. We have neither to spare,
and our own products *are* our venture track. Revisit later.

### Price floors: a strawman for you to overwrite
These are **placeholders so the page can be built**, not recommendations based on our own numbers. I don't
have our rates, Bridj terms or Moj Kolega pricing. Prices in EUR, excluding VAT (B2B; reverse charge in the EU).

| Package | Shape | Strawman floor | Kodeful equivalent |
|---|---|---|---|
| Proof Sprint | one-time, credited into Build | from €1,500 | $497 prototype / free audit |
| Build | fixed per milestone | from €12,000 per project | from $7,200/month |
| Operate | setup + monthly | from €3,900 setup + €690/month | $14,500 + from $3,000/month |
| Embedded Tech Lead | monthly, 3-month minimum | from €4,500/month (2 days/week) | none |
| Moj Kolega | monthly | **your number** | none |

---

## 4. Restructured site (IA)

```
Nav:  Services ▾  Work  Products  Pricing  Blog  About   [Book a call]
        ├ Proof Sprint     /services/proof-sprint
        ├ Build            /services/build
        ├ Operate          /services/operate
        └ Embedded Lead    /services/tech-lead
New:  /services  /pricing   (+ /hr/… mirrors, same slugs as the existing convention)
```

**Homepage changes (the "slight redesign"):**
1. **"What We Do"**: the 4 generic cards become the 4 packages. Each card gets its one-line promise, a
   "from €X", the strongest proof number and a link to its page.
2. **Add "Solutions by problem"**, our answer to use cases. We have 15 case studies; Kodeful has a four-line
   list. Group them by problem the buyer recognises:
   - Answer customers 24/7 → Moj Kolega
   - Publish in many languages → Lider Translations, Country Guides
   - Run a newsroom with a small team → MOJ KRAJ
   - Digitise an archive → Lider PDF Archive
   - Ask questions of your own data → Pitaj Lider, Tvrtko.ai
   - Modernise a legacy system → Rentalica
   - Subtitle and transcribe → Titlomat
   - Catalogue a messy domain → Barcoder
   - Compute instead of prototype → air-laser

   Each tile links to its case study and the package that delivers it.
3. **"Our Process"** moves into each service page, where the steps are specific (and different per package).
4. **Contact**: replace the blanket "At capacity" with per-package availability:
   - Proof Sprint: open
   - Build: next slot <month>
   - Operate: open
   - Tech Lead: 0 of 1 seats
   - Products: open
5. **One primary CTA** everywhere: **"Book a Proof Sprint call"** (or "Book a call"). The current
   "Start a Project" contradicts "at capacity".

**Service-page template** (Kodeful's, with its faults fixed):
Promise → What's included → Process (**per-package steps with real durations**) → **Proof** (2–3 case
studies, real numbers) → Who it's for **and who it isn't for** (our honesty angle) → FAQ (**unique per
page**) → CTA.

**Engineering: one source of truth.** Kodeful's contradictions come from prices and FAQs copied by hand
across pages. We already run a content collection for the blog, so define each package once:
```
src/content/services/{en,hr}/<slug>.yaml   # name, promise, price floor, inclusions, steps, proof slugs, faq[]
```
Each file renders the service page, the pricing card, the homepage card, and the `Service` + `Offer` +
`FAQPage` JSON-LD. The schema validates it:
- A proof slug must be an existing case-study page (same trick as the blog's `related`).
- A price must be a number.
- FAQ questions can't repeat across packages.

A test then fails if any rendered price differs from its YAML. This structure prevents the mistakes Kodeful made by construction.

---

## 5. Decisions I need from you

1. **Capacity.** Are we reopening for paid work, and which packages can we take now? This decides whether
   to launch with all four live or with some marked "next slot <month>".
2. **Price floors.** Replace the strawman in section 3 with real numbers, or tell me to ship "from" prices
   only for some packages and "on request" for others.
3. **Package names.** Proof Sprint / Build / Operate / Embedded Tech Lead, or your own. Croatian names are needed too.
4. **Moj Kolega price.** Show it on our pricing page, or keep it "on request"?
5. **Testimonials.** Kodeful leans on three named quotes; we have none. Can you ask 2–3 clients for a
   real quote (Lider, Bridj, the Rentalica owner)? Until then, the page runs on case-study numbers only.
6. **Contact form vs. email.** Kodeful has a short form (name, email, org, title, details). Keep the
   mailto, or add a form (this needs a backend or a form service, and a consent/privacy line)?
7. **Partner track.** I recommend leaving it out for now.

## 6. Build plan on `feat/pricing-packages` (after the decisions)

1. **Content model.** Build `services` collection, schema, routes (EN+HR), JSON-LD and the price-consistency test.
   Extend `test:routes`, `test:i18n` and `test:seo` to cover the new pages.
2. **Pages.**
   - `/pricing`: package cards, a products row, and a pricing FAQ adapted from Kodeful's best questions:
     why "from", no hourly billing, scope down rather than discount, who owns the code,
     "what if AI can't do it", VAT/EUR, "are you taking work?".
   - `/services` overview, plus four service pages.
3. **Homepage.**
   - Package cards and the solutions grid.
   - Per-package availability in Contact.
   - Nav and footer partials updated through `sync_shared.py`.
4. **Design.** Read `MOTION.md` and `style-guide.md` first. Pricing cards reuse the glass card (16–20px
   radius, 0.08 border), with one gradient word per section and coral for the featured card border.
   Anything not covered there (for example a "most popular" badge) comes back to you as a question.
5. **Verify.** Mutation-probe the new tests, do a local Docker/nginx check, review screenshots at desktop
   and mobile widths, then open a PR for your review. No merge until you approve. IndexNow runs only after deploy.

Nothing on the live site changes until you've reviewed the branch.

---

## 7. Decisions (2026-09-29) and what was built

These answers replace the proposal in sections 3–5 where they differ:
1. **Open for business.** The "At capacity" copy is gone from the homepage and all 18 case-study CTAs. It now reads "Open for new projects", with links to prices and the form.
2. **Price floors similar to Kodeful's**, in EUR, excluding VAT:

   | Package | Floor | Kodeful |
   |---|---|---|
   | AI Prototype | €490 one-time, credited into the build | $497 |
   | Custom AI Product Build | from €6,900/month | from $7,200/month |
   | Embedded Tech Lead | from €4,500/month part-time, from €8,000/month full-time | none |
   | AI Newsroom | €16,000 setup, then from €400/month | Operate: $14,500 + $3,000/month |
   | Multilingual Publishing | €7,900 setup, then from €1,490/month | |
   | AI Knowledge Assistant | €9,900 setup, then from €1,900/month | |
   | Archive Digitisation | from €6,900 per project | |
   | Multi-Site Content Network | €12,900 setup, then from €1,900/month | |
   | Legacy System Rebuild | from €6,900/month | |
3. **Descriptive names**, no brand names: three engagements, plus six "packaged systems", each taken from a system we've already shipped and linked to its case study.
4. **Products are not priced here.** Moj Kolega, Titlomat and Tvrtko.ai appear in a "Ready-made products" row with links only.
5. **No testimonials** for now.
6. **Contact form.** On the homepage and the pricing page. It posts to a new `lumiverse-contact` container, which sends the email through Brevo.

What's built: a single source of prices (`src/pricing/packages.mjs`); `/pricing` and `/hr/pricing` with FAQ, `OfferCatalog` and `FAQPage` JSON-LD; the homepage "What We Do" block rendered from that file; Pricing in the nav and footer; `test:pricing` and `test:contact`. See the README sections "Changing a price or package" and "Deployment → the contact form".

### Still needs your call before merge
- **The prices themselves.** They are the placeholders from section 3, scaled to Kodeful's.
- **Claims these FAQ answers make:**
  - AI model and hosting costs are billed at cost, itemised.
  - The usual start is within two weeks of signing.
  - For packaged systems, "the quote sets out what's yours" on IP.
  - Replies come within 24 hours (the existing claim, kept).
- **Brevo:**
  - Create an API key, and verify `lumiverse.hr` (or the `CONTACT_FROM` domain) as a sender in Brevo.
  - Set `BREVO_API_KEY` in Dokploy.
  - Until then the form answers 503 and shows the email address instead.
- **Privacy:** the form carries a short notice. A full privacy page is still missing from the site.
