import type { Dictionary } from "@/i18n/dictionaries";
import { Figure } from "@/components/icons/Figure";
import s from "./sections.module.css";
import styles from "./Studio.module.css";

export function Studio({ dict }: { dict: Dictionary }) {
  return (
    <section id="studio" className={`${s.section} ${s.wallLight}`} aria-labelledby="studio-title">
      <div className={`${s.inner} ${styles.layout}`}>
        <div>
          <h2 id="studio-title" className={s.title}>{dict.studio.title}</h2>
          <p className={s.lede}>{dict.studio.body}</p>
          <p className={styles.founder}>{dict.studio.founder}</p>
          <p className={styles.links}>
            <a href="https://github.com/LumiVerseHR" rel="me noopener" target="_blank">GitHub</a>
            <a href="https://www.linkedin.com/company/lumiversehr" rel="me noopener" target="_blank">LinkedIn</a>
          </p>
        </div>
        <ul className={styles.principles}>
          {dict.studio.principles.map((p, i) => (
            <li key={p.title} className={styles.principle}>
              <Figure height={34} pointing={i === 1} />
              <div>
                <h3 className={styles.pTitle}>{p.title}</h3>
                <p className={styles.pBody}>{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
