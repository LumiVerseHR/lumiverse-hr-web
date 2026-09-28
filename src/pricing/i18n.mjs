// Copy for the pricing page and the contact form. Package copy and prices
// live in packages.mjs; anything here that quotes a price reads it from there.
import { formatEuro, packageById } from "./packages.mjs";

const from = (id, lang) => formatEuro(packageById.get(id).price.from, lang);

export const routes = {
  en: { pricing: "/pricing", home: "/", contact: "/#contact" },
  hr: { pricing: "/hr/pricing", home: "/hr/", contact: "/hr/#contact" }
};

export const t = {
  en: {
    title: `Pricing - AI Builds and Systems From ${from("ai-prototype", "en")} | LumiVerse`,
    description:
      `Starting prices up front: an AI prototype for ${from("ai-prototype", "en")}, custom AI product builds from ` +
      `${from("custom-ai-build", "en")} a month, and packaged systems like an AI newsroom. No hourly billing.`,
    label: "Pricing",
    heading: ["Know the", "number", "before we talk"],
    intro:
      "Every engagement starts from a real floor. The final price depends on scope, and you get it fixed in writing before any work starts. Prices in EUR, excluding VAT.",
    heroCta: "Tell Us What You Need",
    heroSecondary: "See Our Work",
    workRoute: "/#work",
    engagements: {
      label: "Ways to Work With Us",
      heading: "Start small or go all in",
      text: "A prototype to test the idea, a full build, or a senior tech lead inside your own team."
    },
    systems: {
      label: "Packaged Systems",
      heading: "Built once, ready for yours",
      text: "Each one is built on a system we've already shipped. Setup builds it on your data; the monthly fee runs it, checks its output and keeps improving it."
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
          "Why do you show prices as \"from\"?",
          "Each price is where that kind of work starts, so you know the floor before we talk. The final number depends on scope and what's at stake, and you get it in writing, fixed, before we start."
        ],
        [
          "Do you bill hourly?",
          "No. A build has a flat monthly rate for an agreed number of months. A packaged system has a setup fee, then a flat monthly fee. No timesheets, no surprise overages."
        ],
        [
          "What does the monthly fee on a packaged system cover?",
          "Running it, checking its output and improving it: monitoring, fixes, tuning on real results, and a monthly report of what the checks caught. AI model and hosting costs are billed at cost, itemised."
        ],
        [
          "Do you discount?",
          "No. If the budget is tight, we cut scope, not quality."
        ],
        [
          "What if AI turns out to be the wrong tool?",
          `Then the prototype tells you, for ${from("ai-prototype", "en")} instead of the price of a full build. We would rather lose a project than ship something that doesn't work.`
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
    heading: ["Znajte", "cijenu", "prije razgovora"],
    intro:
      "Svaki angažman ima stvarnu početnu cijenu. Konačna ovisi o opsegu, a dobivate je fiksnu i u pisanom obliku prije početka rada. Cijene su u eurima, bez PDV-a.",
    heroCta: "Recite nam što trebate",
    heroSecondary: "Pogledajte reference",
    workRoute: "/hr/#work",
    engagements: {
      label: "Načini suradnje",
      heading: "Krenite malo ili odmah punom snagom",
      text: "Prototip za provjeru ideje, cijeli razvoj ili senior tech lead unutar Vašeg tima."
    },
    systems: {
      label: "Gotovi sustavi",
      heading: "Izgrađeno jednom, spremno za Vas",
      text: "Svaki se temelji na sustavu koji smo već isporučili. Postavljanje ga gradi na Vašim podacima; mjesečna naknada ga vodi, provjerava njegove rezultate i stalno poboljšava."
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
          "Zašto su cijene navedene kao \"od\"?",
          "Svaka cijena je mjesto gdje takav posao počinje, pa znate donju granicu prije razgovora. Konačni iznos ovisi o opsegu i o tome što je na kocki, a dobivate ga fiksnog i u pisanom obliku prije početka."
        ],
        [
          "Naplaćujete li po satu?",
          "Ne. Razvoj ima fiksnu mjesečnu cijenu za dogovoreni broj mjeseci. Gotov sustav ima naknadu za postavljanje, a zatim fiksnu mjesečnu naknadu. Bez satnica i bez neugodnih iznenađenja."
        ],
        [
          "Što pokriva mjesečna naknada za gotov sustav?",
          "Vođenje sustava, provjeru njegovih rezultata i poboljšanja: nadzor, ispravke, podešavanje na stvarnim rezultatima i mjesečni izvještaj o tome što su provjere uhvatile. Troškovi AI modela i hostinga naplaćuju se po stvarnom trošku, razdvojeno."
        ],
        [
          "Dajete li popuste?",
          "Ne. Ako je budžet tijesan, smanjujemo opseg, ne kvalitetu."
        ],
        [
          "Što ako se pokaže da AI nije pravi alat?",
          `Onda će Vam to reći prototip, za ${from("ai-prototype", "hr")} umjesto cijene cijelog razvoja. Radije ćemo izgubiti projekt nego isporučiti nešto što ne radi.`
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
    systems: "Packaged systems",
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
    systems: "Gotovi sustavi",
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
