// Every service we sell, its starting price and its copy, in both languages.
//
// The pricing page, the homepage service cards, the contact form's options
// and the pricing JSON-LD all render from this file, so each price is
// written exactly once. tools/test-pricing.mjs fails the build if a built
// page shows a price that isn't here, or leaves one of these out.
//
// Prices are EUR, excluding VAT, and every one is a floor ("from"), except
// the prototype, which is a fixed fee.
//
//   price.from   the starting amount
//   price.per    "once" (fixed fee) | "project" | "month" | "setup"
//   price.then   with per: "setup", the monthly fee that follows
//
// `proof` is a case-study slug: the page has to exist, and the claim next to
// it has to be a number that page already states.

// Last change to any price or package: the sitemap's <lastmod> for /pricing.
export const updated = "2026-09-29";

export const groups = ["engagement", "system"];

export const packages = [
  {
    id: "ai-prototype",
    group: "engagement",
    icon: "fa-pencil-ruler",
    price: { from: 490, per: "once" },
    proof: "overserved",
    en: {
      name: "AI Prototype",
      summary: "For testing an idea on real people before you commit to a full build.",
      includes: [
        "A clickable, shareable prototype of the core flows",
        "An honest verdict on where AI helps, and where it doesn't",
        "Scope and a fixed quote for the full build",
        "The fee is credited into the build"
      ],
      proof: "Overserved: an empty repo to a playable game in 3 weeks",
      cta: "Start With a Prototype",
      tag: "Start Here"
    },
    hr: {
      name: "AI prototip",
      summary: "Za provjeru ideje na stvarnim ljudima prije nego što se obvežete na cijeli razvoj.",
      includes: [
        "Klikabilni prototip ključnih tokova koji možete podijeliti",
        "Iskrena procjena gdje AI pomaže, a gdje ne",
        "Opseg i fiksna ponuda za cijeli razvoj",
        "Iznos se uračunava u razvoj"
      ],
      proof: "Overserved: od praznog repozitorija do igre u 3 tjedna",
      cta: "Krenite s prototipom",
      tag: "Prvi korak"
    }
  },
  {
    id: "custom-ai-build",
    group: "engagement",
    icon: "fa-rocket",
    price: { from: 6900, per: "month" },
    proof: "titlomat",
    en: {
      name: "Custom AI Product Build",
      summary: "A production AI product, from agreed scope to paying users, built by a senior team.",
      includes: [
        "Everything in the prototype",
        "Product design and full-stack engineering",
        "An AI pipeline with automated checks on its output",
        "Weekly working demos",
        "100% of the code and IP in your repository"
      ],
      proof: "Titlomat, our own product: a 60-minute episode subtitled in about 5 minutes",
      cta: "Build Your Product"
    },
    hr: {
      name: "Razvoj AI proizvoda po mjeri",
      summary: "AI proizvod u produkciji, od dogovorenog opsega do korisnika koji plaćaju, u izradi senior tima.",
      includes: [
        "Sve iz prototipa",
        "Dizajn proizvoda i full-stack razvoj",
        "AI pipeline s automatskim provjerama rezultata",
        "Radna demonstracija svaki tjedan",
        "100% koda i intelektualnog vlasništva u Vašem repozitoriju"
      ],
      proof: "Titlomat, naš proizvod: titlovi za epizodu od 60 minuta za oko 5 minuta",
      cta: "Izgradite svoj proizvod"
    }
  },
  {
    id: "embedded-tech-lead",
    group: "engagement",
    icon: "fa-drafting-compass",
    price: { from: 4900, per: "month" },
    proof: "bridj",
    en: {
      name: "Embedded Tech Lead",
      summary: "A senior tech lead inside your team: architecture, reviews and release sign-off.",
      includes: [
        "Architecture and technology decisions",
        "Code reviews and team mentoring",
        "Release sign-off you can rely on",
        "Hands-on development when it counts",
        "A flat monthly rate, no timesheets"
      ],
      proof: "Bridj: tech lead on a 17-service platform for over a year",
      cta: "Talk About Your Team"
    },
    hr: {
      name: "Tech lead u Vašem timu",
      summary: "Senior tech lead unutar Vašeg tima: arhitektura, code review i odobravanje izdanja.",
      includes: [
        "Arhitektonske odluke i odabir tehnologija",
        "Code review i mentoriranje tima",
        "Odobravanje izdanja na koje se možete osloniti",
        "Razvoj vlastitim rukama kad je najvažnije",
        "Fiksna mjesečna cijena, bez satnica"
      ],
      proof: "Bridj: više od godinu dana tech lead platforme od 17 servisa",
      cta: "Razgovarajmo o timu"
    }
  },
  {
    id: "ai-newsroom",
    group: "system",
    icon: "fa-newspaper",
    price: { from: 12900, per: "setup", then: 2900 },
    proof: "mojkraj",
    en: {
      name: "AI Newsroom",
      summary: "Original articles written from cited sources, checked before they publish, run by one editor.",
      includes: [
        "Source gathering from the feeds you trust",
        "Articles written fresh, never copied",
        "Automated checks on every article before it publishes",
        "A human signs off before anything goes live"
      ],
      proof: "MOJ KRAJ: 9 automated checks on every article, 1 operator",
      cta: "Ask About a Newsroom"
    },
    hr: {
      name: "AI redakcija",
      summary: "Originalni članci pisani iz navedenih izvora, provjereni prije objave, uz jednog urednika.",
      includes: [
        "Prikupljanje iz izvora kojima vjerujete",
        "Članci pisani iznova, nikad kopirani",
        "Automatske provjere svakog članka prije objave",
        "Čovjek odobrava prije nego što išta izađe"
      ],
      proof: "MOJ KRAJ: 9 automatskih provjera svakog članka, 1 operater",
      cta: "Pitajte za redakciju"
    }
  },
  {
    id: "multilingual-publishing",
    group: "system",
    icon: "fa-language",
    price: { from: 7900, per: "setup", then: 1490 },
    proof: "lider-translations",
    en: {
      name: "Multilingual Publishing",
      summary: "Your site or newsroom translated and published in every language you need, every day.",
      includes: [
        "Author, date, images and categories carried across",
        "A site per language, one shared theme",
        "A daily refresh from your source",
        "Sitemaps per language site, so each one gets found"
      ],
      proof: "Lider Translations: ~1.4M articles in 10 languages",
      cta: "Ask About Translation"
    },
    hr: {
      name: "Višejezično objavljivanje",
      summary: "Vaš portal ili redakcija, preveden i objavljen na svim jezicima koji Vam trebaju, svaki dan.",
      includes: [
        "Autor, datum, slike i kategorije prenose se s člankom",
        "Stranica za svaki jezik, jedna zajednička tema",
        "Dnevno osvježavanje iz Vašeg izvora",
        "Sitemape za svaku jezičnu stranicu, da se svaka može pronaći"
      ],
      proof: "Lider Translations: ~1,4 mil. članaka na 10 jezika",
      cta: "Pitajte za prijevode"
    }
  },
  {
    id: "ai-knowledge-assistant",
    group: "system",
    icon: "fa-comments",
    price: { from: 9900, per: "setup", then: 1900 },
    proof: "pitaj-lider",
    en: {
      name: "AI Knowledge Assistant",
      summary: "Ask your archive, documents or data in plain language, and get answers with sources.",
      includes: [
        "Semantic search over your articles and documents",
        "Answers that cite where they came from",
        "Live data from your systems or public registries",
        "Monthly tuning on the questions people really ask"
      ],
      proof: "Pitaj Lider: 200K+ articles and live company registry data",
      cta: "Ask About an Assistant"
    },
    hr: {
      name: "AI asistent za Vaše znanje",
      summary: "Pitajte svoju arhivu, dokumente ili podatke običnim jezikom i dobijte odgovore s izvorima.",
      includes: [
        "Semantičko pretraživanje Vaših članaka i dokumenata",
        "Odgovori koji navode odakle su",
        "Podaci uživo iz Vaših sustava ili javnih registara",
        "Mjesečno podešavanje na pitanjima koja ljudi stvarno postavljaju"
      ],
      proof: "Pitaj Lider: 200K+ članaka i podaci sudskog registra uživo",
      cta: "Pitajte za asistenta"
    }
  },
  {
    id: "archive-digitisation",
    group: "system",
    icon: "fa-file-pdf",
    price: { from: 6900, per: "project" },
    proof: "lider-pdf-archive",
    en: {
      name: "Archive Digitisation",
      summary: "Decades of print or scanned PDFs, turned into structured, searchable data.",
      includes: [
        "Layout detection and OCR for multi-column pages",
        "Articles followed across pages",
        "Authors and categories extracted",
        "A full-text index and an AI-ready export"
      ],
      proof: "Lider Archive: 50K+ magazine articles processed",
      cta: "Digitise Your Archive"
    },
    hr: {
      name: "Digitalizacija arhive",
      summary: "Desetljeća tiska ili skeniranih PDF-ova, pretvorena u strukturirane podatke koje možete pretraživati.",
      includes: [
        "Prepoznavanje prijeloma i OCR za stranice u više stupaca",
        "Članci praćeni preko više stranica",
        "Izvučeni autori i kategorije",
        "Indeks cijelog teksta i izvoz spreman za AI"
      ],
      proof: "Lider arhiva: obrađeno 50K+ članaka iz časopisa",
      cta: "Digitalizirajte arhivu"
    }
  },
  {
    id: "content-site-network",
    group: "system",
    icon: "fa-globe-europe",
    price: { from: 12900, per: "setup", then: 1900 },
    proof: "country-guides",
    en: {
      name: "Multi-Site Content Network",
      summary: "Many branded sites on one codebase, every page researched, written and checked before it publishes.",
      includes: [
        "One codebase, a config file per site",
        "Research first, then writing, then a readiness gate",
        "Structured data and one canonical URL per page",
        "Deploys that ship only what changed"
      ],
      proof: "Country Guides: 12 live sites on one codebase",
      cta: "Ask About a Network"
    },
    hr: {
      name: "Mreža sadržajnih stranica",
      summary: "Više brendiranih stranica na jednom kodu, a svaka stranica istražena, napisana i provjerena prije objave.",
      includes: [
        "Jedan kod, konfiguracijska datoteka po stranici",
        "Prvo istraživanje, pa pisanje, pa provjera spremnosti",
        "Strukturirani podaci i jedan kanonski URL po stranici",
        "Objave koje isporučuju samo ono što se promijenilo"
      ],
      proof: "Country Guides: 12 živih stranica na jednom kodu",
      cta: "Pitajte za mrežu"
    }
  },
  {
    id: "legacy-system-rebuild",
    group: "system",
    icon: "fa-sync-alt",
    price: { from: 6900, per: "month" },
    proof: "rentalica",
    en: {
      name: "Legacy System Rebuild",
      summary: "Old, undocumented software rebuilt on a modern stack, without losing a record or a user.",
      includes: [
        "Parity first: the old system captured and analysed",
        "A data migration you can verify",
        "Automated tests guarding the rebuild",
        "A rehearsed cutover you can roll back"
      ],
      proof: "Rentalica: 10+ years of data migrated, 0 password resets",
      cta: "Ask About a Rebuild"
    },
    hr: {
      name: "Obnova zastarjelog sustava",
      summary: "Stari, nedokumentirani softver izgrađen iznova na modernoj tehnologiji, bez gubitka ijednog zapisa ili korisnika.",
      includes: [
        "Prvo paritet: stari sustav snimljen i analiziran",
        "Migracija podataka koju možete provjeriti",
        "Automatski testovi koji čuvaju obnovu",
        "Uvježban prelazak koji se može vratiti"
      ],
      proof: "Rentalica: preneseno 10+ godina podataka, 0 resetiranja lozinki",
      cta: "Pitajte za obnovu"
    }
  }
];

export const packageById = new Map(packages.map((pkg) => [pkg.id, pkg]));

// Ready-made products: linked from the pricing page, priced on their own sites.
export const products = [
  {
    slug: "moj-kolega",
    en: { name: "Moj Kolega", summary: "A managed AI employee for your webshop." },
    hr: { name: "Moj Kolega", summary: "Upravljani AI zaposlenik za Vaš webshop." }
  },
  {
    slug: "titlomat",
    en: { name: "Titlomat", summary: "Croatian and English subtitles for YouTube, automatically." },
    hr: { name: "Titlomat", summary: "Hrvatski i engleski titlovi za YouTube, automatski." }
  },
  {
    slug: "tvrtko",
    en: { name: "Tvrtko.ai", summary: "Croatian business intelligence: 200K+ companies." },
    hr: { name: "Tvrtko.ai", summary: "Poslovna inteligencija za Hrvatsku: 200K+ tvrtki." }
  }
];

// "6900" -> "€6,900" / "6.900 €". Grouping by hand: Intl leaves four-digit
// numbers ungrouped in some locales, and a price must read the same everywhere.
export function formatEuro(amount, lang) {
  const digits = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, lang === "hr" ? "." : ",");
  return lang === "hr" ? `${digits} €` : `€${digits}`;
}

const unit = {
  en: { once: "one-time", project: "per project", month: "per month", setup: "setup", from: "from", then: "then from", perMonth: "/month" },
  hr: { once: "jednokratno", project: "po projektu", month: "mjesečno", setup: "postavljanje", from: "od", then: "zatim od", perMonth: "/mj." }
};

// The price as three short strings, so every surface lays it out the same:
//   lead   "from" above the amount (empty for a fixed fee)
//   amount "€6,900"
//   unit   "per month" / "setup"
//   then   "then from €2,900/month" (setup packages only)
export function priceParts(price, lang) {
  const u = unit[lang];
  return {
    lead: price.per === "once" ? "" : u.from,
    amount: formatEuro(price.from, lang),
    unit: u[price.per],
    then: price.then ? `${u.then} ${formatEuro(price.then, lang)}${u.perMonth}` : ""
  };
}

// One line, for places without room for the stacked layout.
export function priceLine(price, lang) {
  const p = priceParts(price, lang);
  return [p.lead, p.amount, p.unit].filter(Boolean).join(" ") + (p.then ? `, ${p.then}` : "");
}
