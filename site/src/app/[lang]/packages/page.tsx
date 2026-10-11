import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import { PackageCard, type Packaged } from "@/components/packages/PackageCard";
import styles from "@/components/packages/Packages.module.css";
import page from "@/components/page/Page.module.css";
import { PageHero, pageMetadata } from "@/components/page/PageHero";
import pricing from "@/components/pricing/Pricing.module.css";
import { packaged } from "@/content/packages.mjs";
import { packagesCopy } from "@/content/pricing-i18n.mjs";
import { hasLocale, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { jsonLdHtml } from "@/lib/jsonld";
import { priceSpecification, type Price } from "@/lib/offer";

const SITE = "https://www.lumiverse.hr";
export type PackagesCopy = (typeof packagesCopy)["en"];

export async function generateMetadata({ params }: PageProps<"/[lang]/packages">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = packagesCopy[lang];
  return pageMetadata(lang, "/packages", c.title, c.description);
}

function catalog(lang: Locale, c: PackagesCopy) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: c.label,
    url: `${SITE}${localePath(lang, "/packages")}`,
    provider: { "@type": "Organization", name: "LumiVerse d.o.o.", url: SITE },
    itemListElement: (packaged as (Packaged & { price: Price })[]).map((pkg) => ({
      "@type": "Offer",
      url: `${SITE}${localePath(lang, `/packages/${pkg.id}`)}`,
      priceCurrency: "EUR",
      priceSpecification: priceSpecification(pkg.price),
      itemOffered: { "@type": "Service", name: pkg[lang].name, description: pkg[lang].summary },
    })),
  };
}

// Fixed-scope, fixed-price services, cheapest first, each ordered through the brief.
export default async function PackagesPage({ params }: PageProps<"/[lang]/packages">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const c = packagesCopy[lang];
  return (
    <>
      <Header lang={lang} dict={dict} path="/packages" />
      <main className={page.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(catalog(lang, c))} />
        <PageHero lang={lang} path="/packages" home={dict.pages.home} label={c.label} title={c.heading} intro={c.intro} />
        <section className={pricing.group} aria-label={c.label}>
          <div className={pricing.grid}>
            {(packaged as Packaged[]).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} lang={lang} labels={c} level={2} />
            ))}
          </div>
        </section>
        <section className={pricing.group} aria-labelledby="how-title">
          <header className={pricing.groupHead}>
            <h2 id="how-title">{c.how}</h2>
          </header>
          <ol className={styles.steps} style={{ marginTop: "clamp(32px, 3.5vw, 56px)" }}>
            {c.steps.map(([title, body]) => (
              <li key={title}>
                <strong>{title}</strong>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </section>
        <p className={styles.customNote}>
          {c.custom}
          <a href={localePath(lang, "/pricing")}>{c.customLink}</a>
        </p>
      </main>
    </>
  );
}
