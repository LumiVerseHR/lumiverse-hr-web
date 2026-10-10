import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Icon } from "@/components/icons/Icon";
import s from "./sections.module.css";
import styles from "./ContactBand.module.css";

// The homepage's last word: one line, one button to the brief. Keeps id="contact" so old links land here.
export function ContactBand({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section id="contact" className={`${s.section} ${s.wallLight}`} aria-labelledby="band-title">
      <div className={`${s.inner} ${styles.band}`}>
        <div>
          <h2 id="band-title" className={s.title}>{dict.contactBand.title}</h2>
          <p className={s.lede}>{dict.contactBand.lede}</p>
        </div>
        <a className={styles.cta} href={localePath(lang, "/contact")}>
          {dict.nav.cta}
          <Icon name="arrow-right" size={16} />
        </a>
      </div>
    </section>
  );
}
