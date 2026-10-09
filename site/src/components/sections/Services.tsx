import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { packageById } from "@/content/packages.mjs";
import { Icon } from "@/components/icons/Icon";
import s from "./sections.module.css";
import styles from "./Services.module.css";

const OFFERS = ["ai-prototype", "custom-ai-build", "embedded-tech-lead"] as const;

type Pkg = { en: Offer; hr: Offer };
type Offer = { name: string; summary: string; includes: string[]; proof: string };

export function Services({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section id="services" className={`${s.section} ${s.wallLight}`} aria-labelledby="services-title">
      <div className={s.inner}>
        <header className={s.head}>
          <h2 id="services-title" className={s.title}>{dict.services.title}</h2>
          <p className={s.lede}>{dict.services.lede}</p>
        </header>
        <div className={styles.offers}>
          {OFFERS.map((id) => {
            const offer = (packageById.get(id) as Pkg)[lang];
            return (
              <article key={id} className={styles.offer}>
                <h3 className={styles.name}>{offer.name}</h3>
                <p className={styles.summary}>{offer.summary}</p>
                <ul className={styles.includes}>
                  {offer.includes.slice(0, 3).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className={styles.proof}>{offer.proof}</p>
              </article>
            );
          })}
        </div>
        <a href={localePath(lang, "/pricing")} className={`${s.arrowLink} ${styles.more}`}>
          {dict.services.more}
          <Icon name="arrow-right" size={16} />
        </a>

        <div className={styles.doors}>
          <h3 className={styles.doorsTitle}>{dict.services.doorsTitle}</h3>
          <ul className={styles.doorList}>
            {dict.services.doors.map((door) => (
              <li key={door.href}>
                <a href={door.href} className={styles.door}>
                  <span>{door.label}</span>
                  <Icon name="arrow-right" size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
