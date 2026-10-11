import Image from "next/image";
import { Header } from "@/components/chrome/Header";
import { Icon } from "@/components/icons/Icon";
import { PriceCard, type Pkg } from "@/components/pricing/PriceCard";
import pricing from "@/components/pricing/Pricing.module.css";
import { Contact } from "@/components/sections/Contact";
import { landings, type Landing } from "@/content/landing";
import { packageById } from "@/content/packages.mjs";
import { t } from "@/content/pricing-i18n.mjs";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCase } from "@/lib/cases";
import styles from "./Landing.module.css";
import { breadcrumbLd, seo } from "@/lib/seo";
import { jsonLdHtml } from "@/lib/jsonld";

export async function LandingPage({ slug, lang, dict }: { slug: Landing["slug"]; lang: Locale; dict: Dictionary }) {
  const page = landings[slug];
  const pkgs = page.packages.map((id) => packageById.get(id) as Pkg);
  const proof = (await Promise.all(page.proof.map(async (s) => ({ slug: s, data: await getCase(s, lang) })))).filter((p) => p.data);
  const faq = (t[lang] as { faq: { items: string[][] } }).faq.items;
  const single = pkgs.length === 1;
  // Proof exhibits use each case study's own first screenshot (crisp, real), not the OG card.
  const exhibits = (
    <div className={styles.exhibits} data-count={proof.length}>
      {proof.map(({ slug: s, data }) => {
        const shot = data!.showcase[0];
        return (
          <a key={s} className={styles.exhibit} href={localePath(lang, `/${s}`)}>
            <span className={styles.frame}>
              <Image src={shot.src} alt="" fill sizes="(max-width: 900px) 92vw, 40vw" />
            </span>
            <span className={styles.exName}>{data!.title.replace(/\n/g, " ").replace(/\.com$/, "")}</span>
            <span className={styles.exKind}>{data!.kind}</span>
            {data!.stats[0] && (
              <span className={styles.exStat}>
                <strong>{data!.stats[0].value}</strong> {data!.stats[0].label}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );

  return (
    <>
      <Header lang={lang} dict={dict} path={`/${slug}`} />
      <main className={styles.page}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdHtml(breadcrumbLd(lang, dict.pages.home, [{ name: page.meta.title[lang].split(/ [-|] /)[0], path: `/${slug}` }]))}
        />
        <section className={styles.hero} aria-labelledby="landing-title">
          <h1 id="landing-title" className={styles.title}>{page.title[lang]}</h1>
          <p className={styles.subtitle}>{page.subtitle[lang]}</p>
          <a className={styles.primary} href="#contact">
            {page.cta[lang]}
            <Icon name="arrow-right" size={16} />
          </a>
        </section>

        {single ? (
          <section className={styles.section} aria-labelledby="path-title">
            <header className={styles.head}>
              <h2 id="path-title">{page.pathTitle[lang]}</h2>
              <p>{page.pathLede[lang]}</p>
            </header>
            <div className={styles.pair}>
              <PriceCard pkg={pkgs[0]} lang={lang} />
              <div>
                <h3 className={styles.pairTitle}>{page.proofTitle[lang]}</h3>
                {exhibits}
              </div>
            </div>
            <a className={pricing.proof} href={localePath(lang, "/pricing")}>
              {dict.services.more}
            </a>
          </section>
        ) : (
          <>
            <section className={styles.section} aria-labelledby="path-title">
              <header className={styles.head}>
                <h2 id="path-title">{page.pathTitle[lang]}</h2>
                <p>{page.pathLede[lang]}</p>
              </header>
              <ol className={styles.path} data-count={pkgs.length}>
                {pkgs.map((pkg, i) => (
                  <li key={pkg.id}>
                    <span className={styles.step}>{String(i + 1).padStart(2, "0")}</span>
                    <PriceCard pkg={pkg} lang={lang} />
                  </li>
                ))}
              </ol>
              <a className={pricing.proof} href={localePath(lang, "/pricing")}>
                {dict.services.more}
              </a>
            </section>
            <section className={styles.section} aria-labelledby="proof-title">
              <header className={styles.head}>
                <h2 id="proof-title">{page.proofTitle[lang]}</h2>
              </header>
              {exhibits}
            </section>
          </>
        )}

        <section className={styles.section} aria-labelledby="faq-title">
          <header className={styles.head}>
            <h2 id="faq-title">{(t[lang] as { faq: { heading: string } }).faq.heading}</h2>
          </header>
          <div className={pricing.faq}>
            {page.faq.map((i) => (
              <details key={i}>
                <summary>{faq[i][0]}</summary>
                <p>{faq[i][1]}</p>
              </details>
            ))}
          </div>
        </section>

        <Contact lang={lang} dict={dict} preset={page.packages[0]} />
      </main>
    </>
  );
}

export function landingMetadata(slug: Landing["slug"], lang: Locale) {
  const page = landings[slug];
  return seo({ lang, path: `/${slug}`, title: page.meta.title[lang], description: page.meta.description[lang] });
}
