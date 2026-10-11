import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import { WorkClip } from "./WorkClip";
import styles from "./Packages.module.css";

export type Work = {
  video: string;
  poster: string;
  shape: "screen" | "wide" | "tall";
  case?: string;
  href?: string;
  site?: string;
} & Record<Locale, { title: string; caption: string }>;

// Where a piece of work points: its case study, a page of ours, or the live site.
export function workLink(item: Work, lang: Locale) {
  if (item.case) return localePath(lang, `/${item.case}`);
  if (item.href?.startsWith("/")) return localePath(lang, item.href);
  return item.href;
}

// The first wide piece of work, for a card's poster: a tall phone video crops badly.
export const coverOf = (work: Work[] = []) => work.find((item) => item.shape !== "tall") ?? work[0];

// Previous work for one package: recordings of things we've shipped, each linked to its story.
// Screen recordings sit in a dark browser frame with the real address, at their own ratio.
export function PackageWork({ work, lang, title }: { work: Work[]; lang: Locale; title: string }) {
  return (
    <section className={styles.block} aria-labelledby="work-title">
      <h2 id="work-title" className={styles.blockTitle}>{title}</h2>
      <div className={styles.work} data-lead={work[0].shape} data-count={work.length}>
        {work.map((item) => {
          const c = item[lang];
          const href = workLink(item, lang);
          const external = href && !href.startsWith("/");
          return (
            <figure key={item.video} className={styles.clip} data-shape={item.shape}>
              <div className={styles.frame}>
                {item.shape === "screen" && (
                  <div className={styles.bar} aria-hidden>
                    <span />
                    <span />
                    <span />
                    <em>{item.site}</em>
                  </div>
                )}
                <WorkClip src={item.video} poster={item.poster} label={`${c.title}: ${c.caption}`} />
              </div>
              <figcaption>
                {href ? (
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
                    {c.title}
                  </a>
                ) : (
                  <strong>{c.title}</strong>
                )}
                <span>{c.caption}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
