import { notFound } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { Contact } from "@/components/sections/Contact";
import { Flagships } from "@/components/sections/Flagships";
import { Notes } from "@/components/sections/Notes";
import { Services } from "@/components/sections/Services";
import { Studio } from "@/components/sections/Studio";
import { Thesis } from "@/components/sections/Thesis";
import { WorkIndex } from "@/components/sections/WorkIndex";
import { Header } from "@/components/chrome/Header";
import { LaserTitle } from "@/components/effects/LaserTitle";
import { Beams } from "@/components/hero/Beams";
import { HeroLaser } from "@/components/hero/HeroLaser";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import styles from "./page.module.css";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
    <main>
    <section className={styles.hero} aria-labelledby="hero-title">
      <Beams />
      <HeroLaser lang={lang} copy={dict.hero.laptop} />

      <Header lang={lang} dict={dict} overlay />

      <div className={styles.copy}>
        <h1 id="hero-title" className={styles.title}>
          <LaserTitle text={dict.hero.titleLines.join("\n")} />
        </h1>
        <p className={styles.subline}>{dict.hero.subline}</p>
        <div className={styles.actions}>
          <a className={styles.cta} href="#contact">
            {dict.hero.cta}
            <Icon name="arrow-right" size={16} />
          </a>
          <a className={styles.link} href="#work">{dict.hero.secondary}</a>
        </div>
      </div>
    </section>
    <Flagships lang={lang} dict={dict} />
    <Thesis lang={lang} dict={dict} />
    <WorkIndex lang={lang} copy={dict.index} />
    <Services lang={lang} dict={dict} />
    <Notes lang={lang} dict={dict} />
    <Studio dict={dict} />
    <Contact lang={lang} dict={dict} />
    </main>
    </>
  );
}
