import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { ModelStage } from "@/components/stage/ModelStage";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import styles from "./page.module.css";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main className={styles.hero}>
      <ModelStage placards={dict.placards} />

      <header className={styles.bar}>
        <Link href={localePath(lang)} className={styles.wordmark} aria-label="LumiVerse">
          LumiVerse<span className={styles.dot} aria-hidden />
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <a href="#work">{dict.nav.work}</a>
          <a href="#services">{dict.nav.services}</a>
          <a href="#research">{dict.nav.research}</a>
          <a href="#studio">{dict.nav.studio}</a>
          <a href="#contact">{dict.nav.contact}</a>
        </nav>
        <div className={styles.end}>
          <div className={styles.locale}>
            <Link href="/" hrefLang="en" aria-current={lang === "en" ? "true" : undefined}>EN</Link>
            <span aria-hidden>/</span>
            <Link href="/hr" hrefLang="hr" aria-current={lang === "hr" ? "true" : undefined}>HR</Link>
          </div>
          <a className={styles.barCta} href="#contact">
            {dict.nav.cta}
            <Icon name="arrow-right" size={14} />
          </a>
        </div>
      </header>

      <div className={styles.copy}>
        <h1 className={styles.title}>
          {dict.hero.titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
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

      <a className={styles.scrollHint} href="#work">
        {dict.hero.scrollHint}
        <Icon name="arrow-down" size={16} />
      </a>
      <p className={styles.orbitHint} aria-hidden>
        {dict.hero.orbitHint}
        <Icon name="orbit" size={22} />
      </p>
    </main>
  );
}
