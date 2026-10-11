import { notFound } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { ContactBand } from "@/components/sections/ContactBand";
import { Flagships } from "@/components/sections/Flagships";
import { Notes } from "@/components/sections/Notes";
import { Services } from "@/components/sections/Services";
import { Thesis } from "@/components/sections/Thesis";
import { Header } from "@/components/chrome/Header";
import { HashForward } from "@/components/chrome/HashForward";
import { LaserTitle } from "@/components/effects/LaserTitle";
import { Beams } from "@/components/hero/Beams";
import { HeroLaser } from "@/components/hero/HeroLaser";
import { PackagesTeaser } from "@/components/packages/PackagesTeaser";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import styles from "./page.module.css";
import { jsonLdHtml } from "@/lib/jsonld";
import { organizationLd } from "@/lib/seo";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
    <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(organizationLd)} />
    <section className={styles.hero} aria-labelledby="hero-title">
      <Beams />
      <HeroLaser lang={lang} copy={dict.hero.exhibit} />

      <Header lang={lang} dict={dict} overlay />

      <div className={styles.copy}>
        <h1 id="hero-title" className={styles.title}>
          <LaserTitle text={dict.hero.titleLines.join("\n")} variants={dict.hero.titleCycle} />
        </h1>
        <p className={styles.subline}>{dict.hero.subline}</p>
        <div className={styles.actions}>
          <a className={styles.cta} href={localePath(lang, "/contact")}>
            {dict.hero.cta}
            <Icon name="arrow-right" size={16} />
          </a>
          <a className={styles.link} href="#work">{dict.hero.secondary}</a>
        </div>
      </div>
    </section>
    {/* A short tour: one teaser per area, each ending in a link to its own page. */}
    <Flagships lang={lang} dict={dict} more />
    <Thesis lang={lang} dict={dict} />
    <Services lang={lang} dict={dict} doors={false} more={{ href: localePath(lang, "/services"), label: dict.services.how }} />
    <PackagesTeaser lang={lang} ids={["web-to-video", "ai-prototype", "animated-hero"]} />
    <Notes lang={lang} dict={dict} />
    <ContactBand lang={lang} dict={dict} />
    <HashForward to={{ studio: localePath(lang, "/studio") }} />
    </main>
    </>
  );
}
