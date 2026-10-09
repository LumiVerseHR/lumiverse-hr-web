import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { flagships, workIndex } from "@/content/work";
import styles from "./Footer.module.css";

// Cached with the page, so the prerendered shell carries the year it was built.
async function copyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = await copyrightYear();
  const work = [...flagships.map((f) => ({ slug: f.slug, name: f.name })), ...workIndex.map((w) => ({ slug: w.slug, name: w.name }))];
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href={localePath(lang)} className={styles.wordmark}>
            LumiVerse<span className={styles.dot} aria-hidden />
          </Link>
          <p className={styles.tagline}>{dict.footer.tagline}</p>
        </div>
        <nav className={styles.columns} aria-label="Footer">
          <div>
            <h2 className={styles.colTitle}>{dict.footer.work}</h2>
            <ul className={styles.workList}>
              {work.map((w) => (
                <li key={w.slug}>
                  <a href={localePath(lang, `/${w.slug}`)}>{w.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={styles.colTitle}>{dict.footer.studio}</h2>
            <ul>
              <li><a href="#services">{dict.nav.services}</a></li>
              <li><a href={localePath(lang, "/pricing")}>{dict.services.more}</a></li>
              <li><Link href="/blog">{dict.notes.title}</Link></li>
              <li><a href="#studio">{dict.nav.studio}</a></li>
            </ul>
          </div>
          <div>
            <h2 className={styles.colTitle}>{dict.footer.contact}</h2>
            <ul>
              <li><a href="mailto:info@lumiverse.hr">info@lumiverse.hr</a></li>
              <li><a href="https://www.linkedin.com/company/lumiversehr" rel="noopener" target="_blank">LinkedIn</a></li>
              <li><a href="https://github.com/LumiVerseHR" rel="noopener" target="_blank">GitHub</a></li>
              <li><a href="/blog/rss.xml">RSS</a></li>
            </ul>
          </div>
        </nav>
      </div>
      <div className={styles.legal}>
        <p>
          © {year} LumiVerse d.o.o. · OIB 88595646800 · Markuševečka cesta 20C, 10000 Zagreb · {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
