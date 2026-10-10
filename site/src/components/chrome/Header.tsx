import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Icon } from "@/components/icons/Icon";
import { MobileMenu } from "@/components/nav/MobileMenu";
import styles from "./Header.module.css";

// One header for every page. `path` is the unprefixed path of the current page,
// so the language switch lands on the same page in the other language. Pages with
// no translation (English-only posts) pass `switchTo` to name where each language goes.
export function Header({
  lang,
  dict,
  path = "/",
  overlay = false,
  switchTo,
}: {
  lang: Locale;
  dict: Dictionary;
  path?: string;
  overlay?: boolean;
  switchTo?: Record<Locale, string>;
}) {
  const target = switchTo ?? { en: localePath("en", path), hr: localePath("hr", path) };
  // Every item is its own page; the one you're on is marked.
  const items = (
    [
      ["/work", dict.nav.work],
      ["/services", dict.nav.services],
      ["/pricing", dict.nav.pricing],
      ["/research", dict.nav.research],
      ["/studio", dict.nav.studio],
    ] as const
  ).map(([to, label]) => ({ href: localePath(lang, to), label, current: path === to || path.startsWith(`${to}/`) }));
  const cta = { href: localePath(lang, "/contact"), label: dict.nav.cta };

  return (
    <header className={`${styles.bar} ${overlay ? styles.overlay : styles.page}`}>
      <Link href={localePath(lang)} className={styles.wordmark} aria-label="LumiVerse">
        LumiVerse<span className={styles.dot} data-laser-origin aria-hidden />
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        {items.map((item) => (
          <a key={item.href} href={item.href} aria-current={item.current ? "page" : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className={styles.end}>
        <div className={styles.locale}>
          <Link href={target.en} hrefLang="en" aria-current={lang === "en" ? "true" : undefined}>EN</Link>
          <span aria-hidden>/</span>
          <Link href={target.hr} hrefLang="hr" aria-current={lang === "hr" ? "true" : undefined}>HR</Link>
        </div>
        <a className={styles.cta} href={cta.href}>
          {cta.label}
          <Icon name="arrow-right" size={14} />
        </a>
        <MobileMenu items={items} cta={cta} labels={{ open: dict.nav.menu, close: dict.nav.close }} />
      </div>
    </header>
  );
}
