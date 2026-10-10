import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import { Icon } from "@/components/icons/Icon";
import { PriceCard, type Pkg } from "@/components/pricing/PriceCard";
import styles from "@/components/pricing/Pricing.module.css";
import { Contact } from "@/components/sections/Contact";
import { PackagesTeaser } from "@/components/packages/PackagesTeaser";
import { inGroup, packages, priceLine, products } from "@/content/packages.mjs";
import { packagesCopy, t } from "@/content/pricing-i18n.mjs";
import { PickPackage } from "@/components/pricing/PickPackage";
import { hasLocale, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { jsonLdHtml } from "@/lib/jsonld";
import { priceSpecification, type Price } from "@/lib/offer";

const SITE = "https://www.lumiverse.hr";

type Copy = {
  title: string;
  description: string;
  label: string;
  heading: string[];
  intro: string;
  heroCta: string;
  heroSecondary: string;
  engagements: { heading: string; text: string };
  upskill: { heading: string; text: string };
  systems: { heading: string; text: string; cta: string };
  products: { heading: string; text: string; more: string };
  faq: { heading: string; items: string[][] };
};
type Product = { slug: string; en: { name: string; summary: string }; hr: { name: string; summary: string } };

export async function generateMetadata({ params }: PageProps<"/[lang]/pricing">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const s = t[lang] as Copy;
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: localePath(lang, "/pricing"), languages: { en: "/pricing", hr: "/hr/pricing" } },
  };
}

function jsonLd(lang: Locale, s: Copy) {
  const route = `${SITE}${localePath(lang, "/pricing")}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: lang === "hr" ? "Početna" : "Home", item: `${SITE}${localePath(lang)}` },
        { "@type": "ListItem", position: 2, name: s.label, item: route },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: s.title.replace(" | LumiVerse", ""),
      url: route,
      provider: { "@type": "Organization", name: "LumiVerse d.o.o.", url: SITE },
      itemListElement: (packages as (Pkg & { price: Price })[]).filter((pkg) => pkg.group !== "package").map((pkg) => ({
        "@type": "Offer",
        url: `${route}#${pkg.group === "system" ? "systems" : pkg.id}`,
        priceCurrency: "EUR",
        priceSpecification: priceSpecification(pkg.price),
        itemOffered: { "@type": "Service", name: pkg[lang].name, description: pkg[lang].summary },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faq.items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = t[lang] as Copy;
  const groups = [
    { id: "engagements", copy: s.engagements, items: inGroup("engagement") as Pkg[] },
    { id: "upskill", copy: s.upskill, items: inGroup("upskill") as Pkg[] },
  ];
  // Custom systems as one ballpark: the lowest setup and running fees, and what they've been built as.
  const systems = inGroup("system") as (Pkg & { price: Price })[];
  const systemsFrom = priceLine(
    {
      from: Math.min(...systems.filter((p) => p.price.per === "setup").map((p) => p.price.from)),
      per: "setup",
      then: Math.min(...systems.map((p) => p.price.then ?? Infinity)),
    },
    lang,
  );
  const jump = [...groups.map((g) => ({ id: g.id, label: g.copy.heading })), { id: "systems", label: s.systems.heading }, { id: "packages", label: packagesCopy[lang].teaserTitle }];

  return (
    <>
      <Header lang={lang} dict={dict} path="/pricing" />
      <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd(lang, s))} />
        <section className={styles.hero} aria-labelledby="pricing-title">
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <a href={localePath(lang)}>{lang === "hr" ? "Početna" : "Home"}</a>
            <span aria-hidden>/</span>
            <span aria-current="page">{s.label}</span>
          </nav>
          <h1 id="pricing-title" className={styles.title}>{s.heading.join(" ")}</h1>
          <p className={styles.intro}>{s.intro}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#contact">
              {s.heroCta}
              <Icon name="arrow-right" size={16} />
            </a>
            <a className={styles.secondary} href={localePath(lang, "/work")}>{s.heroSecondary}</a>
          </div>
          <ul className={styles.jump}>
            {jump.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`}>{g.label}</a>
              </li>
            ))}
          </ul>
        </section>

        {groups.map((g) => (
          <section key={g.id} id={g.id} className={styles.group} aria-labelledby={`${g.id}-title`}>
            <header className={styles.groupHead}>
              <h2 id={`${g.id}-title`}>{g.copy.heading}</h2>
              <p>{g.copy.text}</p>
            </header>
            <div className={styles.grid}>
              {g.items.map((pkg) => (
                <PriceCard key={pkg.id} pkg={pkg} lang={lang} />
              ))}
            </div>
          </section>
        ))}

        <section id="systems" className={styles.group} aria-labelledby="systems-title">
          <header className={styles.groupHead}>
            <h2 id="systems-title">{s.systems.heading}</h2>
            <p>{s.systems.text}</p>
          </header>
          <p className={styles.range}>{systemsFrom}</p>
          <ul className={styles.systems}>
            {systems.map((pkg) => (
              <li key={pkg.id}>
                <strong>{pkg[lang].name}</strong>
                {pkg.proof && pkg[lang].proof && <a href={localePath(lang, `/${pkg.proof}`)}>{pkg[lang].proof}</a>}
              </li>
            ))}
          </ul>
          <PickPackage id="other" className={styles.cta}>
            {s.systems.cta}
            <Icon name="arrow-right" size={16} />
          </PickPackage>
        </section>

        <PackagesTeaser lang={lang} ids={["web-to-video", "animated-hero", "business-website"]} pricingPage />

        <section id="products" className={styles.group} aria-labelledby="products-title">
          <header className={styles.groupHead}>
            <h2 id="products-title">{s.products.heading}</h2>
            <p>{s.products.text}</p>
          </header>
          <div className={styles.products}>
            {(products as Product[]).map((p) => (
              <a key={p.slug} className={styles.product} href={localePath(lang, `/${p.slug}`)}>
                <strong>{p[lang].name}</strong>
                <span>{p[lang].summary}</span>
                <span className={styles.productMore}>
                  {s.products.more}
                  <Icon name="arrow-right" size={14} />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="faq" className={styles.group} aria-labelledby="faq-title">
          <header className={styles.groupHead}>
            <h2 id="faq-title">{s.faq.heading}</h2>
          </header>
          <div className={styles.faq}>
            {s.faq.items.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <Contact lang={lang} dict={dict} />
      </main>
    </>
  );
}
