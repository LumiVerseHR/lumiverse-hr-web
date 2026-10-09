// The hero's idea-to-shipped sequence: real product screenshots and the layout regions
// the sketch traces on them, in the screenshot's own 1440x900 coordinates.
export type Region = { kind: "box" | "text"; x: number; y: number; w: number; h: number };
export type BuildProduct = { id: string; name: string; image: string; alt: Record<"en" | "hr", string>; regions: Region[] };

const text = (x: number, y: number, w: number, h = 40): Region => ({ kind: "text", x, y, w, h });
const box = (x: number, y: number, w: number, h: number): Region => ({ kind: "box", x, y, w, h });

export const buildProducts: BuildProduct[] = [
  {
    id: "moj-kolega",
    name: "Moj Kolega",
    image: "/work/hero/mojkolega-1.jpg",
    alt: {
      en: "Moj Kolega's homepage: a webshop page with the AI employee answering a customer in its chat widget",
      hr: "Naslovnica Moj Kolege: stranica webshopa s AI zaposlenikom koji u chat widgetu odgovara kupcu",
    },
    regions: [
      box(0, 0, 1440, 64),
      box(96, 16, 80, 32),
      box(164, 148, 180, 28),
      text(156, 206, 160, 56),
      text(156, 276, 480, 56),
      text(156, 346, 550, 56),
      text(156, 416, 570, 56),
      text(156, 512, 420, 18),
      text(156, 548, 400, 18),
      text(156, 584, 300, 18),
      box(156, 648, 190, 48),
      box(364, 648, 180, 48),
      box(756, 196, 512, 480),
      box(732, 356, 360, 348),
      box(0, 812, 1440, 52),
    ],
  },
  {
    id: "titlomat",
    name: "Titlomat",
    image: "/work/hero/titlomat-1.jpg",
    alt: {
      en: "Titlomat's homepage: every new video gets Croatian subtitles automatically in about five minutes",
      hr: "Naslovnica Titlomata: svaki novi video automatski za oko pet minuta dobiva titlove",
    },
    regions: [
      box(0, 0, 1440, 64),
      box(96, 20, 96, 28),
      text(96, 200, 430, 16),
      text(96, 236, 590, 72),
      text(96, 310, 510, 68),
      text(96, 382, 540, 72),
      text(96, 452, 250, 68),
      text(96, 588, 560, 18),
      text(96, 620, 560, 18),
      text(96, 652, 500, 18),
      box(96, 712, 192, 44),
      box(300, 712, 184, 44),
      box(804, 292, 524, 444),
      box(780, 690, 200, 64),
    ],
  },
  {
    id: "bridj",
    name: "Bridj",
    image: "/work/hero/bridj-hero.jpg",
    alt: {
      en: "Bridj's homepage: \"I can't shake the feeling we've missed something\"",
      hr: "Naslovnica Bridja: \"I can't shake the feeling we've missed something\"",
    },
    regions: [
      box(0, 0, 1440, 96),
      box(84, 20, 116, 64),
      box(1028, 26, 100, 44),
      box(1156, 26, 100, 44),
      box(1284, 26, 96, 44),
      text(80, 280, 750, 80),
      text(80, 370, 780, 80),
      text(72, 490, 850, 20),
      text(72, 526, 850, 20),
      text(72, 562, 700, 20),
      box(72, 616, 184, 44),
      text(580, 752, 264, 32),
      box(220, 824, 980, 76),
    ],
  },
];
