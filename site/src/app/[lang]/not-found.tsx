import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/chrome/Header";
import { Figure } from "@/components/icons/Figure";
import { flagships } from "@/content/work";
import { hasLocale, homeAnchor, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import styles from "./not-found.module.css";

export default async function NotFound() {
  const value = await rootLang();
  const lang: Locale = hasLocale(value) ? value : "en";
  const dict = await getDictionary(lang);
  const t = dict.notFound;

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className={styles.page}>
        <title>{t.meta}</title>
        <p className={styles.code} aria-hidden>{t.code}</p>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.body}>{t.body}</p>
        {/* An empty plinth, one figure looking for the page that isn't there. */}
        <div className={styles.plinth} aria-hidden>
          <span className={styles.figure}>
            <Figure height={46} pointing />
          </span>
        </div>
        <nav className={styles.links} aria-label={t.title}>
          <a className={styles.home} href={localePath(lang)}>{t.home}</a>
          <a href={homeAnchor(lang, "services")}>{t.services}</a>
          <a href={homeAnchor(lang, "work")}>{t.work}</a>
          <a href={homeAnchor(lang, "contact")}>{t.contact}</a>
        </nav>
        <ul className={styles.flagships}>
          {flagships.map((f) => (
            <li key={f.id}>
              <a href={localePath(lang, `/${f.slug}`)}>
                <strong>{f.name}</strong>
                <span>{f.kind[lang]}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
