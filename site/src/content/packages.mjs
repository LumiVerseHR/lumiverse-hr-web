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
//   price.per    "once" (fixed fee) | "project" | "month" | "day" | "setup"
//   price.then   with per: "setup", the monthly fee that follows
//   price.fullTime  with per: "month", the full-time rate; `from` is then
//                   the part-time rate
//   price.fixed     true when `from` is the price, not a floor (e.g. €1,900 per day)
//
// `pack` (optional) makes a service a package: one defined deliverable at one
// price, listed on /packages with its own page and ordered through the brief.
//   pack.delivery   {en, hr} how long it takes
//   pack.preview    optional {video, poster} or {image}, shown on its page
//   pack.proofHref  optional link for the proof line when it isn't a case study
// Packages also carry `brief` per language: what to send us with the order.
//
// `priceNote` (optional, per language) is a short caveat shown under the price.
//
// `proof` (optional; leave it out rather than stretch a case study to fit)
// is a case-study slug: the page has to exist, and the claim next to
// it has to be something that page already states.

// Last change to any price or package: the sitemap's <lastmod> for /pricing.
export const updated = "2026-10-11";

// Every euro amount a package quotes, for the checks.
export const amountsOf = (price) => [price.from, price.then, price.fullTime].filter(Boolean);

export const groups = ["engagement", "upskill", "system", "package"];

export const packages = [
  {
    id: "ai-prototype",
    group: "engagement",
    icon: "fa-pencil-ruler",
    price: { from: 490, per: "once" },
    proof: "overserved",
    pack: { delivery: { en: "1 week", hr: "1 tjedan" } },
    en: {
      name: "AI Prototype",
      summary: "For testing an idea on real people before you commit to a full build.",
      includes: [
        "A clickable prototype of up to 3 core flows, in one week",
        "One review call, with an honest view on where AI fits and where it doesn't",
        "Scope and a fixed quote for the full build",
        "The fee is credited into the build"
      ],
      proof: "Overserved: an empty repo to a playable game in 3 weeks",
      cta: "Start with a prototype",
      tag: "Start Here",
      brief: ["The idea, in a few lines", "Who it's for", "The one flow that has to work"]
    },
    hr: {
      name: "AI prototip",
      summary: "Za provjeru ideje na stvarnim ljudima prije nego što se obvežete na cijeli razvoj.",
      includes: [
        "Klikabilni prototip do 3 ključna toka, u tjedan dana",
        "Jedan razgovor o prototipu, uz iskreno mišljenje gdje AI pomaže, a gdje ne",
        "Opseg i fiksna ponuda za cijeli razvoj",
        "Iznos se uračunava u razvoj"
      ],
      proof: "Overserved: od praznog repozitorija do igre u 3 tjedna",
      cta: "Krenite s prototipom",
      tag: "Prvi korak",
      brief: ["Ideja, u nekoliko rečenica", "Kome je namijenjena", "Jedan tok koji mora raditi"]
    }
  },
  {
    id: "custom-ai-build",
    group: "engagement",
    icon: "fa-rocket",
    price: { from: 8900, per: "month" },
    proof: "titlomat",
    en: {
      name: "Custom AI Product Build",
      summary: "A production AI product, from agreed scope to paying users, built by senior engineers.",
      includes: [
        "Everything in the prototype",
        "Product design and full-stack engineering",
        "An AI pipeline with automated checks on its output",
        "Weekly working demos",
        "100% of the code and IP in your repository"
      ],
      proof: "Titlomat, our own product: a 60-minute episode subtitled in about 5 minutes",
      cta: "Build your product"
    },
    hr: {
      name: "Razvoj AI proizvoda po mjeri",
      summary: "AI proizvod u produkciji, od dogovorenog opsega do korisnika koji plaćaju, u izradi senior inženjera.",
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
    price: { from: 4500, per: "month", fullTime: 8000 },
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
      proof: "Bridj: tech lead on a 17-service platform for over a year, and still today",
      cta: "Talk about your team"
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
      proof: "Bridj: više od godinu dana tech lead platforme od 17 servisa, i danas",
      cta: "Razgovarajmo o timu"
    }
  },
  {
    id: "ai-team-workshop",
    group: "upskill",
    icon: "fa-chalkboard-teacher",
    price: { from: 1900, per: "day" },
    proof: "air-laser",
    en: {
      name: "AI Team Workshop",
      summary: "A day with your team on your own work: where AI pays off, how to use it well, and the first tools built for you.",
      includes: [
        "A hands-on day, on-site or remote, built around your team's real tasks",
        "Claude and its team tools, used on your documents and workflows",
        "3 to 5 reusable skills for your recurring work, left with your team",
        "A 30-day plan for what to hand to AI first, and what not to"
      ],
      proof: "Air-laser study: one agent loop on Claude Code, the bulk of the work in 3 days",
      cta: "Book a workshop",
      tag: "New"
    },
    hr: {
      name: "AI radionica za tim",
      summary: "Dan s Vašim timom na Vašem stvarnom poslu: gdje se AI isplati, kako ga dobro koristiti i prvi alati izrađeni za Vas.",
      includes: [
        "Praktičan dan, kod Vas ili na daljinu, oko stvarnih zadataka Vašeg tima",
        "Claude i njegovi alati za timove, na Vašim dokumentima i procesima",
        "3 do 5 vještina za posao koji se ponavlja, koje ostaju Vašem timu",
        "Plan za 30 dana: što prvo prepustiti AI-ju, a što ne"
      ],
      proof: "Studija Air-laser: jedna petlja agenata na Claude Codeu, većina posla u 3 dana",
      cta: "Rezervirajte radionicu",
      tag: "Novo"
    }
  },
  {
    id: "ai-team-rollout",
    group: "upskill",
    icon: "fa-users-cog",
    price: { from: 4900, per: "setup", then: 900 },
    en: {
      name: "AI Team Rollout",
      summary: "Your whole company working with AI: a shared skill library, trained people, and a monthly cadence that keeps everyone improving.",
      includes: [
        "Workshops for each team that needs one",
        "A shared library of skills for your workflows, set up for your admin",
        "Admin training, so you can run and extend it in-house",
        "Every month: new skills, office hours and a review of what's being used"
      ],
      cta: "Plan a rollout",
      priceNote: "AI tool licences are not included; you hold them in your own accounts."
    },
    hr: {
      name: "Uvođenje AI-ja u tvrtku",
      summary: "Cijela tvrtka radi s AI-jem: zajednička knjižnica vještina, osposobljeni ljudi i mjesečni ritam u kojem svi napreduju.",
      includes: [
        "Radionice za svaki tim kojem trebaju",
        "Zajednička knjižnica vještina za Vaše procese, postavljena za Vašeg administratora",
        "Obuka administratora, da sustav vodite i širite sami",
        "Svaki mjesec: nove vještine, konzultacije i pregled onoga što se koristi"
      ],
      cta: "Isplanirajte uvođenje",
      priceNote: "Licence za AI alate nisu uključene; držite ih na svojim računima."
    }
  },
  {
    id: "ai-newsroom",
    group: "system",
    icon: "fa-newspaper",
    price: { from: 16000, per: "setup", then: 400 },
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
      cta: "Ask about a newsroom",
      priceNote: "AI token and hosting usage billed separately, at cost."
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
      cta: "Pitajte za redakciju",
      priceNote: "Potrošnja AI tokena i hosting naplaćuju se zasebno, po stvarnom trošku."
    }
  },
  {
    id: "multilingual-publishing",
    group: "system",
    icon: "fa-language",
    price: { from: 7900, per: "setup", then: 180 },
    proof: "lider-translations",
    en: {
      name: "Multilingual Publishing",
      summary: "Your site or newsroom translated and published in every language you need, every day.",
      includes: [
        "Author, date, images and categories carried across",
        "A site per language, one shared theme; setup covers up to 3 languages",
        "A daily refresh from your source",
        "Sitemaps per language site, so each one gets found"
      ],
      proof: "Lider Translations: ~1.4M articles in 10 languages",
      cta: "Ask about translation",
      priceNote: "AI token and hosting usage billed separately, at cost."
    },
    hr: {
      name: "Višejezično objavljivanje",
      summary: "Vaš portal ili redakcija, preveden i objavljen na svim jezicima koji Vam trebaju, svaki dan.",
      includes: [
        "Autor, datum, slike i kategorije prenose se s člankom",
        "Stranica za svaki jezik, jedna zajednička tema; postavljanje uključuje do 3 jezika",
        "Dnevno osvježavanje iz Vašeg izvora",
        "Sitemape za svaku jezičnu stranicu, da se svaka može pronaći"
      ],
      proof: "Lider Translations: ~1,4 mil. članaka na 10 jezika",
      cta: "Pitajte za prijevode",
      priceNote: "Potrošnja AI tokena i hosting naplaćuju se zasebno, po stvarnom trošku."
    }
  },
  {
    id: "ai-knowledge-assistant",
    group: "system",
    icon: "fa-comments",
    price: { from: 4900, per: "setup", then: 250 },
    proof: "pitaj-lider",
    en: {
      name: "AI Knowledge Assistant",
      summary: "Ask your archive, documents or data in plain language, and get answers with sources.",
      includes: [
        "Semantic search over your articles and documents",
        "Answers that cite where they came from",
        "One live data source, from your systems or a public registry; more are quoted separately",
        "An API or a chat widget for your team"
      ],
      proof: "Pitaj Lider: 200K+ articles and live company registry data",
      cta: "Ask about an assistant",
      priceNote: "AI token and hosting usage billed separately, at cost."
    },
    hr: {
      name: "AI asistent za Vaše znanje",
      summary: "Pitajte svoju arhivu, dokumente ili podatke običnim jezikom i dobijte odgovore s izvorima.",
      includes: [
        "Semantičko pretraživanje Vaših članaka i dokumenata",
        "Odgovori koji navode odakle su",
        "Jedan izvor podataka uživo, iz Vaših sustava ili javnog registra; dodatni se nude zasebno",
        "API ili chat widget za Vaš tim"
      ],
      proof: "Pitaj Lider: 200K+ članaka i podaci sudskog registra uživo",
      cta: "Pitajte za asistenta",
      priceNote: "Potrošnja AI tokena i hosting naplaćuju se zasebno, po stvarnom trošku."
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
      cta: "Digitise your archive",
      priceNote: "AI token and pipeline usage billed separately, at cost."
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
      cta: "Digitalizirajte arhivu",
      priceNote: "Potrošnja AI tokena i pipelinea naplaćuje se zasebno, po stvarnom trošku."
    }
  },
  {
    id: "custom-internal-tool",
    group: "system",
    icon: "fa-tools",
    price: { from: 18000, per: "setup", then: 180 },
    proof: "rentalica",
    en: {
      name: "Custom Internal Tool",
      summary: "A tool built around how your company actually works: your data, your processes, your language.",
      includes: [
        "Built on your data and the systems you already run",
        "Dashboards and reports that answer your real questions",
        "An AI assistant that queries your data, read-only",
        "Document scanning and archive, kept in-house"
      ],
      proof: "Rentalica: analytics, a CRM and a read-only AI assistant, built into a rent-a-car system",
      cta: "Ask about a tool",
      priceNote: "AI token and hosting usage billed separately, at cost."
    },
    hr: {
      name: "Interni alat po mjeri",
      summary: "Alat izgrađen oko toga kako Vaša tvrtka stvarno radi: Vaši podaci, Vaši procesi, Vaš jezik.",
      includes: [
        "Izgrađen na Vašim podacima i sustavima koje već koristite",
        "Nadzorne ploče i izvještaji koji odgovaraju na Vaša stvarna pitanja",
        "AI asistent koji pretražuje Vaše podatke, samo za čitanje",
        "Skeniranje i arhiva dokumenata, unutar tvrtke"
      ],
      proof: "Rentalica: analitika, CRM i AI asistent samo za čitanje, ugrađeni u rent-a-car sustav",
      cta: "Pitajte za alat",
      priceNote: "Potrošnja AI tokena i hosting naplaćuju se zasebno, po stvarnom trošku."
    }
  },
  {
    id: "legacy-system-rebuild",
    group: "system",
    icon: "fa-sync-alt",
    price: { from: 8900, per: "month" },
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
      cta: "Ask about a rebuild"
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
  },
  // Packages: one deliverable, one price, ordered through the brief. Each rests on
  // something we've already shipped, named in its proof line.
  {
    id: "web-to-video",
    group: "package",
    icon: "fa-video",
    price: { from: 250, per: "once" },
    pack: {
      delivery: { en: "2 working days", hr: "2 radna dana" },
      preview: { video: "/assets/reel/38bf03/lumiverse-reel.mp4", poster: "/assets/reel/38bf03/poster.jpg" }
    },
    en: {
      name: "Your Web Page as a TikTok Video",
      summary: "A 20-second vertical video for TikTok, Reels and Shorts, made from your live page, not from stock footage.",
      includes: [
        "20 to 25 seconds, vertical 1080×1920",
        "Real screenshots of your page, animated",
        "Captions burned in, so it works without sound",
        "Music cut to the beat",
        "Two rounds of revisions"
      ],
      proof: "Our 22-second launch reel, made with the same pipeline",
      cta: "Order a video",
      brief: ["The URL of the page", "Who the video is for, in one line", "Your logo, if it isn't on the page"]
    },
    hr: {
      name: "Vaša web stranica kao TikTok video",
      summary: "Okomiti video od 20 sekundi za TikTok, Reels i Shorts, napravljen od Vaše stvarne stranice, a ne od stock snimaka.",
      includes: [
        "20 do 25 sekundi, okomito 1080×1920",
        "Stvarne snimke Vaše stranice, animirane",
        "Ugrađeni titlovi, da radi i bez zvuka",
        "Glazba montirana u ritmu",
        "Dva kruga izmjena"
      ],
      proof: "Naš reel od 22 sekunde, napravljen istim postupkom",
      cta: "Naručite video",
      brief: ["Adresa stranice", "Kome je video namijenjen, u jednoj rečenici", "Vaš logo, ako ga nema na stranici"]
    }
  },
  {
    id: "moj-kolega-setup",
    group: "package",
    icon: "fa-robot",
    price: { from: 490, per: "setup", fixed: true },
    proof: "moj-kolega",
    pack: { delivery: { en: "2 weeks", hr: "2 tjedna" } },
    en: {
      name: "Moj Kolega, Set Up for You",
      summary: "Our AI employee on your webshop, trained on your catalogue and tested on real questions before it goes live.",
      includes: [
        "Installed on your WooCommerce or Shopify shop, or any website",
        "Trained on your catalogue, pages and FAQs",
        "Tested against real customer questions before launch",
        "Two weeks of tuning after it goes live"
      ],
      proof: "Moj Kolega: on shift 24/7, improved every month",
      cta: "Order the setup",
      priceNote: "The monthly Moj Kolega plan is billed separately.",
      brief: ["Your webshop's URL and platform", "The role you want: sales, support or reception", "Your FAQs or support emails, if you have them"]
    },
    hr: {
      name: "Moj Kolega, postavljen za Vas",
      summary: "Naš AI zaposlenik na Vašem webshopu, naučen na Vašem katalogu i testiran na stvarnim pitanjima prije nego što krene s radom.",
      includes: [
        "Postavljen na Vaš WooCommerce ili Shopify webshop, ili bilo koju web stranicu",
        "Naučen na Vašem katalogu, stranicama i čestim pitanjima",
        "Testiran na stvarnim pitanjima kupaca prije pokretanja",
        "Dva tjedna podešavanja nakon pokretanja"
      ],
      proof: "Moj Kolega: na smjeni 24/7, poboljšan svaki mjesec",
      cta: "Naručite postavljanje",
      priceNote: "Mjesečni Moj Kolega paket naplaćuje se zasebno.",
      brief: ["Adresa i platforma Vašeg webshopa", "Uloga koju želite: prodaja, podrška ili recepcija", "Vaša česta pitanja ili e-poruke podrške, ako ih imate"]
    }
  },
  {
    id: "animated-hero",
    group: "package",
    icon: "fa-cube",
    price: { from: 999, per: "once" },
    pack: {
      delivery: { en: "4 working days", hr: "4 radna dana" },
      preview: { image: "/blog/laser-cut-hero/cover.webp" },
      proofHref: "/blog/laser-cut-hero"
    },
    en: {
      name: "Animated 3D Hero for Your Homepage",
      summary: "Your product rendered in Blender and cut into being on your homepage, without WebGL or a heavy page.",
      includes: [
        "Your product modelled and lit in Blender, from photos or CAD files",
        "Up to 3 variants, like the three devices on our homepage",
        "A laser-style reveal as a drop-in web component",
        "A still fallback for slow connections and reduced motion",
        "The code for your site, plus a 1080p video cut",
        "Four rounds of revisions"
      ],
      proof: "Our homepage: three exhibits in about 290 KB of images",
      cta: "Order a hero",
      brief: ["Your product: photos, CAD files or a link", "Your homepage's URL", "The headline it should sit under"]
    },
    hr: {
      name: "Animirani 3D hero za Vašu naslovnicu",
      summary: "Vaš proizvod, renderiran u Blenderu i izrezan laserom na Vašoj naslovnici, bez WebGL-a i teške stranice.",
      includes: [
        "Vaš proizvod modeliran i osvijetljen u Blenderu, iz fotografija ili CAD datoteka",
        "Do 3 varijante, poput tri uređaja na našoj naslovnici",
        "Otkrivanje laserom kao gotova web komponenta",
        "Statična slika za spore veze i smanjeno kretanje",
        "Kod za Vašu stranicu, uz video od 1080p",
        "Četiri kruga izmjena"
      ],
      proof: "Naša naslovnica: tri eksponata u oko 290 KB slika",
      cta: "Naručite hero",
      brief: ["Vaš proizvod: fotografije, CAD datoteke ili poveznica", "Adresa Vaše naslovnice", "Naslov ispod kojeg će stajati"]
    }
  },
  {
    id: "business-website",
    group: "package",
    icon: "fa-globe",
    price: { from: 3900, per: "once" },
    pack: { delivery: { en: "1.5 weeks", hr: "1,5 tjedana" }, proofHref: "/" },
    en: {
      name: "Business Website, Up to 20 Pages",
      summary: "A fast, bilingual company website, designed and built by the team behind this one.",
      includes: [
        "Up to 20 pages, designed for your brand",
        "Two languages, with SEO basics in both",
        "A contact form that lands in your inbox",
        "Hosting set up on your own account",
        "Two rounds of revisions, and 30 days of content edits after launch"
      ],
      proof: "lumiverse.hr: this site, built on the same stack",
      cta: "Order a website",
      brief: ["Your current website, if you have one", "The pages and languages you need", "Two or three websites you like, and why"]
    },
    hr: {
      name: "Poslovna web stranica, do 20 stranica",
      summary: "Brza dvojezična stranica tvrtke, koju dizajnira i gradi tim koji je izradio i ovu.",
      includes: [
        "Do 20 stranica, dizajniranih za Vaš brend",
        "Dva jezika, uz osnovni SEO na oba",
        "Kontakt obrazac koji stiže u Vaš sandučić",
        "Hosting postavljen na Vašem računu",
        "Dva kruga izmjena i 30 dana izmjena sadržaja nakon objave"
      ],
      proof: "lumiverse.hr: ova stranica, na istoj tehnologiji",
      cta: "Naručite stranicu",
      brief: ["Vaša trenutna stranica, ako je imate", "Koje stranice i jezike trebate", "Dvije ili tri stranice koje Vam se sviđaju i zašto"]
    }
  },
  {
    id: "premium-website",
    group: "package",
    icon: "fa-film",
    price: { from: 4900, per: "once" },
    pack: {
      delivery: { en: "3 weeks", hr: "3 tjedna" },
      preview: { image: "/blog/laser-cut-hero/exhibits.webp" },
      proofHref: "/"
    },
    en: {
      name: "Premium Website With Video or 3D",
      summary: "Everything in the business website, plus the motion that makes people stop scrolling: a 3D hero or a video, built in.",
      includes: [
        "Everything in the business website package",
        "An animated 3D hero or a short video, made for your brand",
        "Motion on the pages that matter, without a heavy page",
        "Up to 20 pages in two languages, with SEO basics in both",
        "Two rounds of revisions, and 30 days of content edits after launch"
      ],
      proof: "lumiverse.hr: the laser-cut hero on this homepage",
      cta: "Order a premium website",
      brief: ["Your current website, if you have one", "The pages and languages you need", "Your product or brand, and whether you'd like 3D or video"]
    },
    hr: {
      name: "Premium web stranica s videom ili 3D-om",
      summary: "Sve iz poslovne web stranice, uz pokret zbog kojeg ljudi prestanu skrolati: 3D hero ili video, ugrađen u stranicu.",
      includes: [
        "Sve iz paketa poslovne web stranice",
        "Animirani 3D hero ili kratki video, izrađen za Vaš brend",
        "Pokret na stranicama koje su važne, bez teške stranice",
        "Do 20 stranica na dva jezika, uz osnovni SEO na oba",
        "Dva kruga izmjena i 30 dana izmjena sadržaja nakon objave"
      ],
      proof: "lumiverse.hr: laserom izrezan hero na ovoj naslovnici",
      cta: "Naručite premium stranicu",
      brief: ["Vaša trenutna stranica, ako je imate", "Koje stranice i jezike trebate", "Vaš proizvod ili brend te želite li 3D ili video"]
    }
  }
];

export const packageById = new Map(packages.map((pkg) => [pkg.id, pkg]));

// A group in display order: engagements as listed above, packaged systems
// cheapest first by their headline price (stable, so ties keep file order).
export function inGroup(group) {
  const members = packages.filter((pkg) => pkg.group === group);
  return group === "system" ? members.sort((a, b) => a.price.from - b.price.from) : members;
}

// Everything orderable as a package, cheapest first.
export const packaged = packages.filter((pkg) => pkg.pack).sort((a, b) => a.price.from - b.price.from);

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
  en: {
    once: "one-time", project: "per project", month: "per month", day: "per day", setup: "setup", from: "from", then: "then from", perMonth: "/month",
    partTime: "per month, 2 days a week", fullTime: "full-time from"
  },
  hr: {
    once: "jednokratno", project: "po projektu", month: "mjesečno", day: "po danu", setup: "postavljanje", from: "od", then: "zatim od", perMonth: "/mj.",
    partTime: "mjesečno, 2 dana tjedno", fullTime: "puno radno vrijeme od"
  }
};

// The price as three short strings, so every surface lays it out the same:
//   lead   "from" above the amount (empty for a fixed fee)
//   amount "€6,900"
//   unit   "per month" / "per day" / "setup"
//   then   "then from €2,900/month" (setup packages), or
//          "full-time from €8,000/month" (part-time/full-time packages)
export function priceParts(price, lang) {
  const u = unit[lang];
  const then = price.then
    ? `${u.then} ${formatEuro(price.then, lang)}${u.perMonth}`
    : price.fullTime
      ? `${u.fullTime} ${formatEuro(price.fullTime, lang)}${u.perMonth}`
      : "";
  return {
    lead: price.per === "once" || price.fixed ? "" : u.from,
    amount: formatEuro(price.from, lang),
    unit: price.fullTime ? u.partTime : u[price.per],
    then
  };
}

// One line, for places without room for the stacked layout.
export function priceLine(price, lang) {
  const p = priceParts(price, lang);
  return [p.lead, p.amount, p.unit].filter(Boolean).join(" ") + (p.then ? `, ${p.then}` : "");
}
