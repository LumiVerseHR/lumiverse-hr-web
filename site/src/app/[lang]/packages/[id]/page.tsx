import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import { Icon } from "@/components/icons/Icon";
import type { Packaged } from "@/components/packages/PackageCard";
import { PackageWork } from "@/components/packages/PackageWork";
import styles from "@/components/packages/Packages.module.css";
import page from "@/components/page/Page.module.css";
import { PageHero, pageMetadata } from "@/components/page/PageHero";
import pricing from "@/components/pricing/Pricing.module.css";
import { packaged, priceParts } from "@/content/packages.mjs";
import { packagesCopy } from "@/content/pricing-i18n.mjs";
import { hasLocale, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { jsonLdHtml } from "@/lib/jsonld";
import { priceSpecification, type Price } from "@/lib/offer";

const SITE = "https://www.lumiverse.hr";

type Copy = { name: string; summary: string; includes: string[]; proof?: string; priceNote?: string; brief: string[] };
type Pkg = Packaged & {
  price: Price;
  proof?: string;
  pack: Packaged["pack"] & { proofHref?: string };
  en: Copy;
  hr: Copy;
};

// Unknown ids must wait for the full render so notFound() can answer with a real 404.
export const ensureStatic = "navigation";

const find = (id: string) => (packaged as Pkg[]).find((pkg) => pkg.id === id);

export function generateStaticParams() {
  return (packaged as Pkg[]).map((pkg) => ({ id: pkg.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/packages/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const pkg = find(id);
  if (!hasLocale(lang) || !pkg) return {};
  const c = pkg[lang];
  const price = priceParts(pkg.price, lang) as { amount: string };
  return pageMetadata(lang, `/packages/${id}`, `${c.name} - ${price.amount} | LumiVerse`, c.summary);
}

// Case studies are translated; blog posts and the homepage path are not prefixed the same way.
function proofLink(pkg: Pkg, lang: Locale) {
  if (pkg.proof) return localePath(lang, `/${pkg.proof}`);
  const href = pkg.pack.proofHref;
  if (!href) return undefined;
  return href.startsWith("/blog") ? href : localePath(lang, href);
}

export default async function PackagePage({ params }: PageProps<"/[lang]/packages/[id]">) {
  const { lang, id } = await params;
  const pkg = find(id);
  if (!hasLocale(lang) || !pkg) notFound();
  const dict = await getDictionary(lang);
  const t = packagesCopy[lang];
  const c = pkg[lang];
  const p = priceParts(pkg.price, lang) as { lead: string; amount: string; unit: string };
  const proof = proofLink(pkg, lang);
  const order = `${localePath(lang, "/contact")}?package=${pkg.id}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: c.name,
    description: c.summary,
    provider: { "@type": "Organization", name: "LumiVerse d.o.o.", url: SITE },
    offers: {
      "@type": "Offer",
      url: `${SITE}${localePath(lang, `/packages/${pkg.id}`)}`,
      priceCurrency: "EUR",
      priceSpecification: priceSpecification(pkg.price),
    },
  };

  return (
    <>
      <Header lang={lang} dict={dict} path={`/packages/${pkg.id}`} />
      <main className={page.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(ld)} />
        <PageHero
          lang={lang}
          path={`/packages/${pkg.id}`}
          home={dict.pages.home}
          parent={{ label: t.label, path: "/packages" }}
          label={c.name}
          title={c.name}
          intro={c.summary}
        />
        <div className={styles.detail}>
          <div>
            {pkg.pack.work?.length ? <PackageWork work={pkg.pack.work} lang={lang} title={t.work} /> : null}
            <section className={styles.block} aria-labelledby="includes-title">
              <h2 id="includes-title" className={styles.blockTitle}>{t.includes}</h2>
              <ul className={pricing.includes}>
                {c.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className={styles.block} aria-labelledby="brief-title">
              <h2 id="brief-title" className={styles.blockTitle}>{t.brief}</h2>
              <ul className={pricing.includes}>
                {c.brief.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className={styles.block} aria-labelledby="how-title">
              <h2 id="how-title" className={styles.blockTitle}>{t.how}</h2>
              <ol className={styles.steps}>
                {t.steps.map(([title, body]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <aside className={`${pricing.card} ${styles.panel}`} aria-label={c.name}>
            <p className={pricing.price} style={{ marginTop: 0 }}>
              {p.lead && <span className={pricing.lead}>{p.lead}</span>}
              <span className={pricing.amount}>{p.amount}</span>
              <span className={pricing.unit}>{p.unit}</span>
            </p>
            {c.priceNote && <p className={pricing.note}>{c.priceNote}</p>}
            <p className={styles.delivery}>
              {t.delivery}: {pkg.pack.delivery[lang]}
            </p>
            {c.proof && (proof ? (
              <a className={pricing.proof} href={proof}>{c.proof}</a>
            ) : (
              <p className={pricing.proof}>{c.proof}</p>
            ))}
            <a className={styles.order} href={order}>
              {t.order}
              <Icon name="arrow-right" size={16} />
            </a>
          </aside>
        </div>
        <p className={styles.customNote}>
          <a href={localePath(lang, "/packages")} style={{ marginLeft: 0 }}>{t.all}</a>
        </p>
      </main>
    </>
  );
}
