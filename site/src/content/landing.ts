import type { Locale } from "@/i18n/config";

// Audience landing pages. Package names, summaries, inclusions and prices come from
// packages.mjs and FAQ answers from the pricing copy; only the framing lines here are new.
type Text = Record<Locale, string>;

export type Landing = {
  slug: "tech-lead" | "technical-founder";
  meta: { title: Text; description: Text };
  title: Text;
  subtitle: Text;
  /** Packages shown as the offer, in order; the first one is preselected in the brief. */
  packages: string[];
  pathTitle: Text;
  pathLede: Text;
  proofTitle: Text;
  /** Case studies that prove it, by slug. */
  proof: string[];
  /** Questions from the pricing FAQ, by their position there. */
  faq: number[];
};

export const landings: Record<Landing["slug"], Landing> = {
  "tech-lead": {
    slug: "tech-lead",
    meta: {
      title: { en: "Embedded Tech Lead for Your Team | LumiVerse", hr: "Tech lead u Vašem timu | LumiVerse" },
      description: {
        en: "A senior tech lead inside your team: architecture, reviews and release sign-off. A flat monthly rate, no timesheets.",
        hr: "Senior tech lead unutar Vašeg tima: arhitektura, code review i odobravanje izdanja. Fiksna mjesečna cijena, bez satnica.",
      },
    },
    title: { en: "A senior tech lead, inside your team", hr: "Senior tech lead, unutar Vašeg tima" },
    subtitle: {
      en: "Architecture, reviews and release sign-off from someone who ships with your team, not from a deck.",
      hr: "Arhitektura, code review i odobravanje izdanja od nekoga tko isporučuje s Vašim timom, a ne iz prezentacije.",
    },
    packages: ["embedded-tech-lead"],
    pathTitle: { en: "What you get", hr: "Što dobivate" },
    pathLede: {
      en: "Part-time, two days a week, or full-time. Either way, one flat monthly rate.",
      hr: "Dva dana tjedno ili puno radno vrijeme. U oba slučaja, jedna fiksna mjesečna cijena.",
    },
    proofTitle: { en: "Where we do it now", hr: "Gdje to radimo sada" },
    proof: ["bridj"],
    faq: [1, 7, 8, 9],
  },
  "technical-founder": {
    slug: "technical-founder",
    meta: {
      title: { en: "For Founders Without a Technical Co-founder | LumiVerse", hr: "Za osnivače bez tehničkog suosnivača | LumiVerse" },
      description: {
        en: "You have the idea and the market. We test it on real people, build the product with senior engineers, then stay on as your tech lead.",
        hr: "Vi imate ideju i tržište. Mi je provjerimo na stvarnim ljudima, izgradimo proizvod sa senior inženjerima i ostajemo kao Vaš tech lead.",
      },
    },
    title: { en: "The technical side of your startup, covered", hr: "Tehnička strana Vašeg startupa, pokrivena" },
    subtitle: {
      en: "You have the idea and the market. We bring senior engineering: test it on real people, build the product, then stay on as your tech lead.",
      hr: "Vi imate ideju i tržište. Mi donosimo senior inženjerstvo: provjerimo ideju na stvarnim ljudima, izgradimo proizvod, a zatim ostajemo kao Vaš tech lead.",
    },
    packages: ["ai-prototype", "custom-ai-build", "embedded-tech-lead"],
    pathTitle: { en: "One path, three steps", hr: "Jedan put, tri koraka" },
    pathLede: {
      en: "Each step has a fixed price in writing before it starts, and each one feeds the next.",
      hr: "Svaki korak ima fiksnu cijenu u pisanom obliku prije početka, i svaki se nastavlja u sljedeći.",
    },
    proofTitle: { en: "We do it for ourselves first", hr: "Prvo to radimo za sebe" },
    proof: ["titlomat", "tvrtko", "moj-kolega"],
    faq: [6, 5, 7, 4],
  },
};
