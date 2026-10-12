// Copy for the pricing page and the contact form. Package copy and prices
// live in packages.mjs; anything here that quotes a price reads it from there.
import { formatEuro, packageById } from "./packages.mjs";

const from = (id, lang) => formatEuro(packageById.get(id).price.from, lang);

export const routes = {
  en: { pricing: "/pricing", home: "/", contact: "/contact" },
  hr: { pricing: "/hr/pricing", home: "/hr/", contact: "/hr/contact" }
};

export const t = {
  en: {
    title: `Pricing - AI Builds and Systems From ${from("ai-prototype", "en")} | LumiVerse`,
    description:
      `Starting prices up front: an AI prototype for ${from("ai-prototype", "en")}, custom AI product builds from ` +
      `${from("custom-ai-build", "en")} a month, and packaged systems like an AI newsroom. No hourly billing.`,
    label: "Pricing",
    heading: ["Ballpark", "numbers", "before we talk"],
    intro:
      "Every engagement starts from a real floor. The final price depends on scope, and you get it fixed in writing before any work starts. Prices in EUR, excluding VAT.",
    heroCta: "Tell us what you need",
    heroSecondary: "See our work",
    workRoute: "/work",
    engagements: {
      label: "Ways to Work With Us",
      heading: "Start small or go all in",
      text: "A prototype to test the idea, a full build, or a senior tech lead inside your own team."
    },
    upskill: {
      label: "Upskill Your Team",
      heading: "Make your own team AI‑native",
      text: "Rather do it yourselves? We train your people on their own work and leave them the tools, so the next system gets built in-house."
    },
    systems: {
      label: "Packaged Systems",
      heading: "Custom AI systems",
      text: "Newsrooms, translation, assistants on your documents, archives, internal tools and rebuilds. Each one starts from a system we've already shipped: setup builds it on your data, and a small monthly fee keeps it running. AI usage and hosting are billed at cost.",
      cta: "Describe your system"
    },
    products: {
      label: "Ready-Made Products",
      heading: "Rather use something today?",
      text: "Our own products are open for sign-up, each priced on its own site.",
      more: "See the product"
    },
    faq: {
      label: "FAQ",
      heading: "Before you ask",
      items: [
        [
          "Why do you show prices as “from”?",
          "Each price is where that kind of work starts, so you know the floor before we talk. The final number depends on scope and what's at stake, and you get it in writing, fixed, before we start."
        ],
        [
          "Do you bill hourly?",
          "No. A build has a flat monthly rate for an agreed number of months. A packaged system has a setup fee, then a flat monthly fee. No timesheets, no surprise overages."
        ],
        [
          "What does the monthly fee on a packaged system cover?",
          "Keeping it running: monitoring, hosting oversight, and fixes when something breaks. AI model and hosting costs are billed at cost, itemised. Tuning and new features are quoted separately, so the monthly fee stays small."
        ],
        [
          "Can you train our team instead of building it for us?",
          "Yes. An AI team rollout trains your people on their own work, sets up a shared library of skills, and keeps a monthly cadence so the team keeps improving."
        ],
        [
          "Do you discount?",
          "No. If the budget is tight, we cut scope, not quality."
        ],
        [
          "What if AI turns out to be the wrong tool?",
          "We'll say so while scoping, before you've paid for a build. When the answer depends on your data, we test on a sample first and quote that as its own small step. We would rather lose a project than ship something that doesn't work."
        ],
        [
          "Who owns the code?",
          "For a custom build, you do: 100% of the code and IP, in your repository and your accounts. Packaged systems reuse components we've built before, and the quote sets out exactly what's yours."
        ],
        [
          "How soon can you start?",
          "Usually within two weeks of signing. A prototype is the fastest way in, and it feeds straight into the build."
        ],
        [
          "Do you work outside Croatia?",
          "Yes. We're based in Zagreb but work globally, and English is our main working language. Our longest current engagement is with a UK company."
        ],
        [
          "Do prices include VAT?",
          "No. Prices are in euros, excluding VAT. EU businesses with a VAT number are invoiced under the reverse charge."
        ]
      ]
    }
  },
  hr: {
    title: `Cijene - AI razvoj i sustavi od ${from("ai-prototype", "hr")} | LumiVerse`,
    description:
      `Cijene unaprijed: AI prototip za ${from("ai-prototype", "hr")}, razvoj AI proizvoda od ` +
      `${from("custom-ai-build", "hr")} mjesečno i gotovi sustavi poput AI redakcije. Bez naplate po satu.`,
    label: "Cijene",
    heading: ["Okvirne", "cijene", "prije razgovora"],
    intro:
      "Svaki angažman ima stvarnu početnu cijenu. Konačna ovisi o opsegu, a dobivate je fiksnu i u pisanom obliku prije početka rada. Cijene su u eurima, bez PDV-a.",
    heroCta: "Recite nam što trebate",
    heroSecondary: "Pogledajte reference",
    workRoute: "/hr/work",
    engagements: {
      label: "Načini suradnje",
      heading: "Krenite malo ili odmah punom snagom",
      text: "Prototip za provjeru ideje, cijeli razvoj ili senior tech lead unutar Vašeg tima."
    },
    upskill: {
      label: "Osposobite svoj tim",
      heading: "Vaš tim, spreman za rad s AI‑jem",
      text: "Radije biste sami? Osposobljavamo Vaše ljude na njihovom stvarnom poslu i ostavljamo im alate, da sljedeći sustav izgradite u kući."
    },
    systems: {
      label: "Gotovi sustavi",
      heading: "AI sustavi po mjeri",
      text: "Redakcije, prijevodi, asistenti nad Vašim dokumentima, arhive, interni alati i obnove sustava. Svaki kreće od sustava koji smo već isporučili: postavljanje ga gradi na Vašim podacima, a mala mjesečna naknada održava ga u radu. AI potrošnja i hosting naplaćuju se po stvarnom trošku.",
      cta: "Opišite svoj sustav"
    },
    products: {
      label: "Gotovi proizvodi",
      heading: "Radije biste krenuli odmah?",
      text: "Naši proizvodi otvoreni su za prijavu, a cijene su na njihovim stranicama.",
      more: "Pogledajte proizvod"
    },
    faq: {
      label: "Česta pitanja",
      heading: "Prije nego što pitate",
      items: [
        [
          "Zašto su cijene navedene kao „od“?",
          "Svaka cijena je mjesto gdje takav posao počinje, pa znate donju granicu prije razgovora. Konačni iznos ovisi o opsegu i o tome što je na kocki, a dobivate ga fiksnog i u pisanom obliku prije početka."
        ],
        [
          "Naplaćujete li po satu?",
          "Ne. Razvoj ima fiksnu mjesečnu cijenu za dogovoreni broj mjeseci. Gotov sustav ima naknadu za postavljanje, a zatim fiksnu mjesečnu naknadu. Bez satnica i bez neugodnih iznenađenja."
        ],
        [
          "Što pokriva mjesečna naknada za gotov sustav?",
          "Održavanje sustava u radu: nadzor, brigu o hostingu i ispravke kad se nešto pokvari. Troškovi AI modela i hostinga naplaćuju se po stvarnom trošku, razdvojeno. Podešavanje i nove funkcije nude se zasebno, pa mjesečna naknada ostaje mala."
        ],
        [
          "Možete li osposobiti naš tim umjesto da gradite za nas?",
          "Da. Uvođenje AI-ja u tvrtku osposobljava Vaše ljude na njihovom stvarnom poslu, postavlja zajedničku knjižnicu vještina i drži mjesečni ritam u kojem tim napreduje."
        ],
        [
          "Dajete li popuste?",
          "Ne. Ako je budžet tijesan, smanjujemo opseg, ne kvalitetu."
        ],
        [
          "Što ako se pokaže da AI nije pravi alat?",
          "Reći ćemo Vam to tijekom definiranja opsega, prije nego što platite razvoj. Kad odgovor ovisi o Vašim podacima, prvo testiramo na uzorku i to nudimo kao zaseban mali korak. Radije ćemo izgubiti projekt nego isporučiti nešto što ne radi."
        ],
        [
          "Tko je vlasnik koda?",
          "Kod razvoja po mjeri, Vi: 100% koda i intelektualnog vlasništva, u Vašem repozitoriju i na Vašim računima. Gotovi sustavi koriste komponente koje smo već izgradili, a ponuda točno navodi što je Vaše."
        ],
        [
          "Koliko brzo možete početi?",
          "Obično unutar dva tjedna od potpisa. Prototip je najbrži početak i izravno se nastavlja u razvoj."
        ],
        [
          "Radite li izvan Hrvatske?",
          "Da. Sjedište nam je u Zagrebu, ali radimo globalno, a engleski nam je glavni radni jezik. Naš najdulji trenutni angažman je s tvrtkom iz Ujedinjenog Kraljevstva."
        ],
        [
          "Jesu li cijene s PDV-om?",
          "Nisu. Cijene su u eurima, bez PDV-a. Tvrtkama iz EU s PDV brojem izdajemo račun po prijenosu porezne obveze."
        ]
      ]
    }
  }
};

// The contact form, on the homepage and the pricing page.
export const form = {
  en: {
    label: "Get in Touch",
    heading: "Tell us what you're building",
    text: "Pick what you need, or describe it in your own words. We reply within 24 hours.",
    name: "Name",
    email: "Email",
    company: "Company",
    optional: "optional",
    interest: "What do you need?",
    interestAny: "Not sure yet",
    interestOther: "Something else",
    engagements: "Ways to work with us",
    upskill: "Upskill your team",
    systems: "Packaged systems",
    packages: "Packages",
    message: "Tell us about it",
    messageHint: "What you want to build or fix, and anything you already know about timing or budget.",
    submit: "Send Your Brief",
    sending: "Sending…",
    sent: "Thanks, it's in our inbox. We'll reply within 24 hours.",
    error: "That didn't send. Please email us at",
    privacy:
      "We use these details only to reply to you. They reach our inbox through Brevo, our EU email provider, and go nowhere else. LumiVerse d.o.o. is responsible for them; ask us to delete them any time.",
    noscript: "The form needs JavaScript. You can email us instead:"
  },
  hr: {
    label: "Javite nam se",
    heading: "Recite nam što gradite",
    text: "Odaberite što Vam treba ili to opišite svojim riječima. Odgovaramo u roku od 24 sata.",
    name: "Ime i prezime",
    email: "E-mail",
    company: "Tvrtka",
    optional: "nije obavezno",
    interest: "Što Vam treba?",
    interestAny: "Još ne znam",
    interestOther: "Nešto drugo",
    engagements: "Načini suradnje",
    upskill: "Osposobite svoj tim",
    systems: "Gotovi sustavi",
    packages: "Paketi",
    message: "Opišite nam",
    messageHint: "Što želite izgraditi ili popraviti te sve što već znate o rokovima ili budžetu.",
    submit: "Pošaljite upit",
    sending: "Šaljem…",
    sent: "Hvala, upit je stigao. Odgovorit ćemo u roku od 24 sata.",
    error: "Slanje nije uspjelo. Pišite nam na",
    privacy:
      "Ove podatke koristimo samo da Vam odgovorimo. Do našeg sandučića stižu preko Brevoa, našeg pružatelja e-pošte iz EU, i ne idu nikamo drugdje. Za njih odgovara LumiVerse d.o.o.; zatražite brisanje kad god želite.",
    noscript: "Obrazac treba JavaScript. Možete nam pisati i izravno:"
  }
};

export const contactEmail = "tihomir.jauk@lumiverse.hr";

// The packages index and each package's own page. Package copy and prices live in packages.mjs.
export const packagesCopy = {
  en: {
    title: `Packages - Fixed-Price AI and Web Services From ${from("web-to-video", "en")} | LumiVerse`,
    description:
      "Fixed scope, fixed price, ordered in one message: a TikTok video of your web page, an AI prototype, a website, a 3D hero and more. EUR, excl. VAT.",
    label: "Packages",
    heading: "One thing, one price",
    intro:
      "Each package is a defined deliverable we've already built for ourselves or a client. The scope and the price are on the card. Order it, and you get a confirmation and an invoice within 24 hours. Prices in EUR, excluding VAT.",
    custom: "Need something bigger or less defined?",
    customLink: "See ballpark pricing for custom work",
    details: "What's included",
    order: "Order",
    more: "Details",
    delivery: "Delivery",
    includes: "What you get",
    brief: "What to send us",
    proof: "Proof",
    work: "Previous work",
    how: "How ordering works",
    steps: [
      ["Send the brief", "Pick the package and send what's listed above. Two minutes."],
      ["Get it confirmed", "Within 24 hours we confirm the scope and the date, and send the invoice."],
      ["Receive it", "Delivered in the time on the card, with the revisions it includes."]
    ],
    all: "All packages",
    teaserTitle: "Or order one defined thing",
    teaserLink: "See all packages"
  },
  hr: {
    title: `Paketi - AI i web usluge po fiksnoj cijeni od ${from("web-to-video", "hr")} | LumiVerse`,
    description:
      "Fiksni opseg, fiksna cijena, narudžba u jednoj poruci: TikTok video od Vaše stranice, AI prototip, web stranica, 3D hero i više. U eurima, bez PDV-a.",
    label: "Paketi",
    heading: "Jedna stvar, jedna cijena",
    intro:
      "Svaki paket je definirana isporuka koju smo već izradili za sebe ili za klijenta. Opseg i cijena pišu na kartici. Naručite ga i u roku od 24 sata dobivate potvrdu i račun. Cijene su u eurima, bez PDV-a.",
    custom: "Trebate nešto veće ili manje određeno?",
    customLink: "Pogledajte okvirne cijene za rad po mjeri",
    details: "Što je uključeno",
    order: "Naručite",
    more: "Detalji",
    delivery: "Isporuka",
    includes: "Što dobivate",
    brief: "Što nam pošaljite",
    proof: "Dokaz",
    work: "Dosadašnji rad",
    how: "Kako funkcionira narudžba",
    steps: [
      ["Pošaljite upit", "Odaberite paket i pošaljite ono što je navedeno gore. Dvije minute."],
      ["Dobijte potvrdu", "U roku od 24 sata potvrđujemo opseg i termin te šaljemo račun."],
      ["Primite isporuku", "Isporučeno u roku s kartice, s uključenim izmjenama."]
    ],
    all: "Svi paketi",
    teaserTitle: "Ili naručite jednu određenu stvar",
    teaserLink: "Pogledajte sve pakete"
  }
};
