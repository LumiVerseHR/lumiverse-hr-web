import type { Dictionary } from "@/i18n/dictionaries";
import s from "./sections.module.css";
import styles from "./Studio.module.css";

// `bare`: on the studio page the h1 carries the title, so only the body and principles remain.
export function Studio({ dict, bare = false }: { dict: Dictionary; bare?: boolean }) {
  // Bare, the items sit right under the page's h1, so they step up to h2.
  const Name = bare ? "h2" : "h3";
  return (
    <section
      id={bare ? undefined : "studio"}
      className={`${s.section} ${s.wallLight} ${bare ? s.tight : ""}`}
      aria-labelledby={bare ? "page-title" : "studio-title"}
    >
      <div className={`${s.inner} ${styles.layout}`}>
        <div>
          {!bare && <h2 id="studio-title" className={s.title}>{dict.studio.title}</h2>}
          <p className={bare ? styles.body : s.lede}>{dict.studio.body}</p>
          <p className={styles.founder}>{dict.studio.founder}</p>
          <p className={styles.links}>
            <a href="https://github.com/LumiVerseHR" rel="me noopener" target="_blank">GitHub</a>
            <a href="https://www.linkedin.com/company/lumiversehr" rel="me noopener" target="_blank">LinkedIn</a>
          </p>
        </div>
        <ul className={styles.principles}>
          {dict.studio.principles.map((p) => (
            <li key={p.title} className={styles.principle}>
              <span className={styles.dash} aria-hidden />
              <div>
                <Name className={styles.pTitle}>{p.title}</Name>
                <p className={styles.pBody}>{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
