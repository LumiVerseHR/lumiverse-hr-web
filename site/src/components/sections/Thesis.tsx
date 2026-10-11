import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Figure } from "@/components/icons/Figure";
import { Icon } from "@/components/icons/Icon";
import s from "./sections.module.css";
import styles from "./Thesis.module.css";

export function Thesis({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const [first, second] = dict.thesis.lines;
  return (
    <section className={`${s.section} ${styles.thesis}`} aria-labelledby="thesis-title">
      <div className={s.inner}>
        <h2 id="thesis-title" className={styles.statement}>
          <span className={styles.muted}>{first}</span>
          <span className={styles.line}>
            {second.split(" ").slice(0, -1).join(" ")}{second.includes(" ") ? " " : ""}
            <span className={styles.tail}>
              {second.split(" ").slice(-1)[0]}
              <span className={styles.figure}>
                <Figure height={64} pointing />
              </span>
            </span>
          </span>
        </h2>
        <div className={styles.body}>
          <p>{dict.thesis.body}</p>
          <a href={localePath("en", dict.thesis.href)} hrefLang={lang === "hr" ? "en" : undefined} className={s.arrowLink}>
            {dict.thesis.link}
            <Icon name="arrow-right" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
