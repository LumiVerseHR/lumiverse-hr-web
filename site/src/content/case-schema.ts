// The shape every case study is stored in: site/content/cases/<slug>.json = { en: CaseStudy, hr: CaseStudy }.
// Text is per locale and copied verbatim from the live pages; images live in /public/work/<slug>/.

export type Link = { label: string; href: string; external?: boolean };
export type Img = { src: string; alt: string; caption?: string; width: number; height: number };

export type Block =
  | { type: "text"; paragraphs: string[] }
  | { type: "list"; items: { title?: string; body: string }[] }
  | { type: "cards"; items: { title: string; body: string; meta?: string }[] }
  | { type: "steps"; items: { title: string; body: string; label?: string }[] }
  | { type: "images"; items: Img[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "plans"; items: { name: string; price: string; period?: string; features: string[]; note?: string; cta?: Link }[] };

export type Section = { id?: string; title: string; lede?: string; blocks: Block[] };

export type CaseStudy = {
  slug: string;
  meta: { title: string; description: string; ogImage?: string };
  kind: string; // the tag pill on the live page, e.g. "AI Employee"
  title: string;
  titleNote?: string; // e.g. "(My Colleague)"
  subtitle: string;
  ctas: Link[];
  showcase: Img[]; // hero screenshots, in order
  stats: { value: string; label: string }[];
  sections: Section[];
  closing?: { title: string; body: string; cta: Link; secondary?: Link };
  notes?: string[]; // anything on the live page that did not fit this schema, for the builder to handle
};
