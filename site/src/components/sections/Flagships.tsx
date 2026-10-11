import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { flagships, type Flagship } from "@/content/work";
import { Icon } from "@/components/icons/Icon";
import s from "./sections.module.css";
import styles from "./Flagships.module.css";

// `bare` drops the heading when the page's own h1 already says it; `only` narrows the exhibits;
// `more` adds the link to the full work page (the homepage teaser).
export function Flagships({
  lang,
  dict,
  bare = false,
  only,
  more = false,
}: {
  lang: Locale;
  dict: Dictionary;
  bare?: boolean;
  only?: Flagship["id"][];
  more?: boolean;
}) {
  const shown = only ? flagships.filter((f) => only.includes(f.id)) : flagships;
  // Bare, the items sit right under the page's h1, so they step up to h2.
  const Name = bare ? "h2" : "h3";
  return (
    <section
      id={bare ? undefined : "work"}
      className={`${s.section} ${s.wallLight} ${bare ? s.tight : ""}`}
      aria-labelledby={bare ? "page-title" : "work-title"}
    >
      <div className={s.inner}>
        {!bare && (
          <header className={s.head}>
            <h2 id="work-title" className={s.title}>{dict.flagships.title}</h2>
            <p className={s.lede}>{dict.flagships.lede}</p>
          </header>
        )}
        <div className={styles.exhibits} data-count={shown.length}>
          {shown.map((f, i) => (
            <article key={f.id} id={f.id === "air-laser" ? "research" : undefined} className={styles.exhibit}>
              <a href={localePath(lang, `/${f.slug}`)} className={styles.frame} aria-label={`${f.name}: ${dict.flagships.open}`}>
                <Image
                  src={f.image}
                  alt={f.alt[lang]}
                  fill
                  sizes="(max-width: 900px) 92vw, 30vw"
                  className={styles.shot}
                  priority={bare && i === 0}
                />
              </a>
              <div className={styles.label}>
                <Name className={styles.name}>{f.name}</Name>
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
        {more && (
          <a href={localePath(lang, "/work")} className={`${s.arrowLink} ${styles.more}`}>
            {dict.flagships.all}
            <Icon name="arrow-right" size={16} />
          </a>
        )}
      </div>
    </section>
  );
}
