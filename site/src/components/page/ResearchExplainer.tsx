import { Icon } from "@/components/icons/Icon";
import s from "@/components/sections/sections.module.css";
import { localePath, type Locale } from "@/i18n/config";
import styles from "./Research.module.css";

const PAPER = "https://github.com/LumiVerseHR/air-laser-physics/releases/tag/paper-v1.0";

type Copy = {
  label: string;
  title: string;
  lede: string;
  how: string;
  steps: [string, string][];
  facts: [string, string][];
  figure: string;
  honest: string;
  paper: string;
  case: string;
};

// The air-laser study in plain words, before the case-study card: what kind of research
// it is, what the device does, and what was computed rather than built.
export function ResearchExplainer({ lang, copy }: { lang: Locale; copy: Copy }) {
  return (
    <section className={`${s.section} ${s.tight}`} aria-labelledby="explainer-title">
      <div className={s.inner}>
        <p className={styles.label}>{copy.label}</p>
        <h2 id="explainer-title" className={s.title}>{copy.title}</h2>
        <p className={s.lede}>{copy.lede}</p>
        <div className={styles.split}>
          <div>
            <h3 className={styles.how}>{copy.how}</h3>
            <ol className={styles.steps}>
              {copy.steps.map(([title, body]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
          <figure className={styles.figure}>
            {/* eslint-disable-next-line @next/next/no-img-element -- one fixed-size study figure */}
            <img src="/work/air-laser/airlaser-localize.jpg" width={1440} height={900} loading="lazy" alt="" />
            <figcaption>{copy.figure}</figcaption>
          </figure>
        </div>
        <dl className={styles.facts}>
          {copy.facts.map(([value, label]) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.honest}>{copy.honest}</p>
        <div className={styles.links}>
          <a href={PAPER} className={s.arrowLink} target="_blank" rel="noopener">
            {copy.paper}
            <Icon name="arrow-right" size={16} />
          </a>
          <a href={localePath(lang, "/air-laser")} className={s.arrowLink}>
            {copy.case}
            <Icon name="arrow-right" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
