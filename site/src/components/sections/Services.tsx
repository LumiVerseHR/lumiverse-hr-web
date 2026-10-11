import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { packageById } from "@/content/packages.mjs";
import { Icon } from "@/components/icons/Icon";
import s from "./sections.module.css";
import styles from "./Services.module.css";

const OFFERS = ["ai-prototype", "custom-ai-build", "embedded-tech-lead"];

type Pkg = { en: Offer; hr: Offer };
type Offer = { name: string; summary: string; includes: string[]; proof: string };

// The homepage shows the three ways in and links on; the services page shows them bare under its
// own h1, then the upskilling offers, the pricing link and the specific doors.
export function Services({
  lang,
  dict,
  bare = false,
  ids = OFFERS,
  heading,
  more = { href: localePath(lang, "/pricing"), label: dict.services.more },
  doors = true,
}: {
  lang: Locale;
  dict: Dictionary;
  bare?: boolean;
  ids?: string[];
  heading?: string;
  more?: { href: string; label: string } | null;
  doors?: boolean;
}) {
  const headId = heading ? `services-${ids[0]}` : "services-title";
  // Bare, the items sit right under the page's h1, so they step up to h2.
  const Name = bare ? "h2" : "h3";
  return (
    <section
      id={bare || heading ? undefined : "services"}
      className={`${s.section} ${heading ? "" : s.wallLight} ${bare ? s.tight : ""}`}
      aria-labelledby={bare ? "page-title" : headId}
    >
      <div className={s.inner}>
        {!bare && (
          <header className={s.head}>
            <h2 id={headId} className={s.title}>{heading ?? dict.services.title}</h2>
            {!heading && <p className={s.lede}>{dict.services.lede}</p>}
          </header>
        )}
        <div className={styles.offers} data-count={ids.length}>
          {ids.map((id) => {
            const offer = (packageById.get(id) as Pkg)[lang];
            return (
              <article key={id} className={styles.offer}>
                <Name className={styles.name}>{offer.name}</Name>
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
        {more && (
          <a href={more.href} className={`${s.arrowLink} ${styles.more}`}>
            {more.label}
            <Icon name="arrow-right" size={16} />
          </a>
        )}

        {doors && (
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
        )}
      </div>
    </section>
  );
}
