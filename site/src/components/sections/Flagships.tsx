import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { flagships } from "@/content/work";
import { Icon } from "@/components/icons/Icon";
import s from "./sections.module.css";
import styles from "./Flagships.module.css";

export function Flagships({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section id="work" className={`${s.section} ${s.wallLight}`} aria-labelledby="work-title">
      <div className={s.inner}>
        <header className={s.head}>
          <h2 id="work-title" className={s.title}>{dict.flagships.title}</h2>
          <p className={s.lede}>{dict.flagships.lede}</p>
        </header>
        <div className={styles.exhibits}>
          {flagships.map((f) => (
            <article key={f.id} id={f.id === "air-laser" ? "research" : undefined} className={styles.exhibit}>
              <a href={localePath(lang, `/${f.slug}`)} className={styles.frame} aria-label={`${f.name}: ${dict.flagships.open}`}>
                <Image src={f.image} alt={f.alt[lang]} fill sizes="(max-width: 900px) 92vw, 30vw" className={styles.shot} />
              </a>
              <div className={styles.label}>
                <h3 className={styles.name}>{f.name}</h3>
                <p className={styles.kind}>{f.kind[lang]}</p>
                <p className={styles.stat}>
                  <span className={styles.value}>{f.stat.value}</span>
                  <span className={styles.unit}>{f.stat.unit[lang]}</span>
                </p>
                <p className={styles.summary}>{f.summary[lang]}</p>
                <a href={localePath(lang, `/${f.slug}`)} className={s.arrowLink}>
                  {dict.flagships.open}
                  <Icon name="arrow-right" size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
