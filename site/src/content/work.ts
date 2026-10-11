import type { Locale } from "@/i18n/config";

// Every fact here comes from a live case study (the legacy pages at the same slugs).
type Text = Record<Locale, string>;

export type Flagship = {
  id: "moj-kolega" | "bridj" | "air-laser" | "lider-translations" | "mojkraj" | "overserved";
  slug: string;
  name: string;
  image: string;
  alt: Text;
  kind: Text;
  stat: { value: string; unit: Text };
  summary: Text;
};

export const flagships: Flagship[] = [
  {
    id: "moj-kolega",
    slug: "moj-kolega",
    name: "Moj Kolega",
    image: "/work/mojkolega-card.jpg",
    alt: {
      en: "Moj Kolega answering a customer in the chat widget on a webshop page",
      hr: "Moj Kolega odgovara kupcu u chat widgetu na stranici webshopa",
    },
    kind: { en: "AI employee · our product", hr: "AI zaposlenik · naš proizvod" },
    stat: { value: "24/7", unit: { en: "on shift", hr: "na smjeni" } },
    summary: {
      en: "A managed AI employee for your webshop. It answers customers, recommends from your catalogue, captures leads and escalates to your team. We set it up and improve it every month.",
      hr: "AI zaposlenik za Vaš webshop. Odgovara kupcima, preporučuje iz Vašeg kataloga, prikuplja upite i prosljeđuje ih Vašem timu. Mi ga postavljamo i svaki mjesec poboljšavamo.",
    },
  },
  {
    id: "bridj",
    slug: "bridj",
    name: "Bridj",
    image: "/work/bridj-card.jpg",
    alt: {
      en: "Bridj's homepage: what your customers are saying, before anyone thinks to ask",
      hr: "Naslovnica Bridja: što Vaši klijenti govore, prije nego što itko pomisli pitati",
    },
    kind: { en: "Embedded tech lead · UK", hr: "Tech lead u timu klijenta · UK" },
    stat: { value: "17", unit: { en: "services, every release signed off", hr: "servisa, svako izdanje s našim potpisom" } },
    summary: {
      en: "A year and counting as embedded tech lead for a UK intelligence platform: a 17-service system with an AI agent layer, multi-cloud infrastructure, and the final sign-off on every release.",
      hr: "Više od godinu dana kao ugrađeni tech lead britanske platforme za poslovnu inteligenciju: sustav od 17 servisa sa slojem AI agenata, multi-cloud infrastrukturom i završnom riječju na svakom izdanju.",
    },
  },
  {
    id: "air-laser",
    slug: "air-laser",
    name: "Air-laser",
    image: "/work/airlaser-wire.jpg",
    alt: {
      en: "Air-laser voxel images, front and side views of the computed display volume",
      hr: "Air-laser voksel slike, prednji i bočni pogled na izračunati volumen prikaza",
    },
    kind: { en: "Independent research", hr: "Neovisno istraživanje" },
    stat: { value: "49", unit: { en: "pages, computed not built", hr: "stranica, izračunato, ne izgrađeno" } },
    summary: {
      en: "A physics design study for an image that floats in mid-air, computed end to end by a dozen open-source simulators driven by one AI agent loop. The one result that failed its cross-check was retracted.",
      hr: "Studija fizike za sliku koja lebdi u zraku, izračunata od početka do kraja s desetak open-source simulatora koje vodi jedna petlja AI agenata. Jedini rezultat koji nije prošao provjeru povučen je.",
    },
  },
  {
    id: "lider-translations",
    slug: "lider-translations",
    name: "Lider Translations",
    image: "/work/lidertranslations-1.jpg",
    alt: {
      en: "One of the Lider translation sites: the Croatian business newsroom published in another language",
      hr: "Jedna od prevedenih stranica Lidera: hrvatska poslovna redakcija objavljena na drugom jeziku",
    },
    kind: { en: "AI translation · client work", hr: "AI prevođenje · rad za klijenta" },
    stat: { value: "10", unit: { en: "languages, ~1.4M articles published", hr: "jezika, ~1,4 mil. objavljenih članaka" } },
    summary: {
      en: "One Croatian newsroom translated into ten languages and published as ten more live news sites, kept current every day by a pipeline that runs itself.",
      hr: "Jedna hrvatska redakcija prevedena na deset jezika i objavljena kao deset novih news portala, koje svaki dan ažurira pipeline koji radi sam.",
    },
  },
  {
    id: "mojkraj",
    slug: "mojkraj",
    name: "MOJ KRAJ.",
    image: "/work/mojkraj-home.jpg",
    alt: {
      en: "MOJ KRAJ.'s national front page: a calm, content-first news layout",
      hr: "Naslovnica MOJ KRAJ.-a: miran raspored vijesti u kojem je sadržaj na prvom mjestu",
    },
    kind: { en: "AI newsroom · our product", hr: "AI redakcija · naš proizvod" },
    stat: { value: "8", unit: { en: "checks every draft must pass", hr: "provjera koje svaki nacrt mora proći" } },
    summary: {
      en: "A Croatian news portal run as a public experiment: every article written fresh from cited sources, claims checked against the source before it publishes, and news from the towns big media left behind.",
      hr: "Hrvatski news portal vođen kao javni eksperiment: svaki članak napisan iznova iz citiranih izvora, tvrdnje provjerene prema izvoru prije objave, uz vijesti iz mjesta koja su veliki mediji napustili.",
    },
  },
  {
    id: "overserved",
    slug: "overserved",
    name: "Overserved",
    image: "/work/overserved-landing.jpg",
    alt: {
      en: "Overserved's title screen: a satirical tower defence game about serving users",
      hr: "Naslovni ekran Overserveda: satirična tower defense igra o usluživanju korisnika",
    },
    kind: { en: "AI-built game · our project", hr: "Igra izrađena uz AI · naš projekt" },
    stat: { value: "140", unit: { en: "levels, built in about three weeks", hr: "razina, izrađeno u otprilike tri tjedna" } },
    summary: {
      en: "A satirical AI-themed tower defence where you serve users instead of shooting them: seven markets and 600+ generated art assets, as an honest test of how far AI-assisted development goes.",
      hr: "Satirični tower defense na temu AI-ja u kojem korisnike uslužujete, a ne gađate: sedam tržišta i više od 600 generiranih grafika, kao iskren test dokle razvoj uz AI zaista stiže.",
    },
  },
];

export type WorkItem = {
  slug: string;
  name: string;
  image: string;
  kind: Text;
  fact: Text;
};

// The rest of the work, newest strengths first; one hard fact each.
export const workIndex: WorkItem[] = [
  {
    slug: "country-guides",
    name: "Country Guides",
    image: "/work/countryguides-1.jpg",
    kind: { en: "AI content platform · our product", hr: "AI platforma za sadržaj · naš proizvod" },
    fact: { en: "14 branded guide sites, one codebase", hr: "14 brendiranih vodiča, jedna baza koda" },
  },
  {
    slug: "tvrtko",
    name: "Tvrtko.ai",
    image: "/work/tvrtko-ai-landing.jpg",
    kind: { en: "Business intelligence · our product", hr: "Poslovna inteligencija · naš proizvod" },
    fact: { en: "200,000+ Croatian companies", hr: "200.000+ hrvatskih tvrtki" },
  },
  {
    slug: "titlomat",
    name: "Titlomat",
    image: "/work/titlomat-1.jpg",
    kind: { en: "YouTube subtitles · our product", hr: "YouTube titlovi · naš proizvod" },
    fact: { en: "Croatian and English subtitles, automatically", hr: "Hrvatski i engleski titlovi, automatski" },
  },
  {
    slug: "barcoder",
    name: "Barcoder",
    image: "/work/barcoder-landing.jpg",
    kind: { en: "Reference platform", hr: "Referentna platforma" },
    fact: { en: "463 standards across 197 countries", hr: "463 standarda iz 197 zemalja" },
  },
  {
    slug: "rentalica",
    name: "Rentalica",
    image: "/work/rentalica-landing.jpg",
    kind: { en: "Legacy modernisation", hr: "Modernizacija naslijeđenog sustava" },
    fact: { en: "A decade on PHP 5.6, rebuilt as multi-tenant SaaS", hr: "Desetljeće na PHP-u 5.6, prepisano u multi-tenant SaaS" },
  },
  {
    slug: "aimito",
    name: "The Aimito",
    image: "/work/aimito-landing.jpg",
    kind: { en: "Commerce & content engine", hr: "Trgovina i pogon za sadržaj" },
    fact: { en: "889 original designs, searchable by feeling", hr: "889 originalnih dizajna, pretraživih po dojmu" },
  },
  {
    slug: "pitaj-lider",
    name: "Pitaj Lider",
    image: "/work/pitaj-lider-ai-assistant.jpg",
    kind: { en: "AI assistant", hr: "AI asistent" },
    fact: { en: "200,000+ articles, asked in plain language", hr: "200.000+ članaka, pitanja prirodnim jezikom" },
  },
  {
    slug: "lider-pdf-archive",
    name: "Lider Digital Archive",
    image: "/work/0017_014.jpg",
    kind: { en: "Document AI", hr: "AI za dokumente" },
    fact: { en: "50,000+ articles out of scanned PDFs", hr: "50.000+ članaka iz skeniranih PDF-ova" },
  },
  {
    slug: "army-adria",
    name: "ARMY Adria",
    image: "/work/armyadria-1.jpg",
    kind: { en: "Community platform", hr: "Platforma zajednice" },
    fact: { en: "Built by one fan with no code background, in two weeks", hr: "Izradila jedna obožavateljica bez programiranja, u dva tjedna" },
  },
];
