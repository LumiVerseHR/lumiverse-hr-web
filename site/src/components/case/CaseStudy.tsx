import { Fragment } from "react";
import Image from "next/image";
import type { CaseStudy as Case } from "@/content/case-schema";
import type { Locale } from "@/i18n/config";
import { homeAnchor, localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { flagships, workIndex } from "@/content/work";
import { Icon } from "@/components/icons/Icon";
import { BlockView } from "./Blocks";
import { LaserTitle } from "@/components/effects/LaserTitle";
import { Showcase } from "./Showcase";
import styles from "./CaseStudy.module.css";

const ORDER = [...flagships.map((f) => ({ slug: f.slug, name: f.name })), ...workIndex.map((w) => ({ slug: w.slug, name: w.name }))];

function LinkButton({ link, primary }: { link: Case["ctas"][number]; primary?: boolean }) {
  return (
    <a
      href={link.href}
      className={primary ? styles.primary : styles.secondary}
      {...(link.external ? { target: "_blank", rel: "noopener" } : {})}
    >
      {link.label}
      <Icon name="arrow-right" size={16} />
    </a>
  );
}

// The capacity note is one sentence with its links inline, as on the live pages.
function linkify(sentence: string, links: (Case["ctas"][number] | undefined)[]) {
  const parts: (string | Case["ctas"][number])[] = [sentence];
  for (const link of links) {
    if (!link) continue;
    const i = parts.findIndex((p) => typeof p === "string" && p.includes(link.label));
    if (i < 0) continue;
    const [before, ...rest] = (parts[i] as string).split(link.label);
    parts.splice(i, 1, before, link, rest.join(link.label));
  }
  return parts.map((p, i) => (typeof p === "string" ? p : <a key={i} href={p.href}>{p.label}</a>));
}

export function CaseStudy({ data, lang, dict }: { data: Case; lang: Locale; dict: Dictionary }) {
  const extra = data.showcase.slice(1);
  const at = ORDER.findIndex((o) => o.slug === data.slug);
  const next = ORDER[(at + 1) % ORDER.length];
  const prev = ORDER[(at - 1 + ORDER.length) % ORDER.length];

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="case-title">
        <div className={styles.topbar}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <a href={homeAnchor(lang, "work")}>{dict.case.work}</a>
            <span aria-hidden>/</span>
            <span aria-current="page">{data.title.replace(/\n/g, " ")}</span>
          </nav>
          {/* A compact pager up top; the large one closes the page. */}
          <nav className={styles.pager} aria-label={dict.case.more}>
            <a href={localePath(lang, `/${prev.slug}`)} aria-label={`${dict.case.prev}: ${prev.name}`}>
              <Icon name="chevron-left" size={16} />
              <span>{prev.name}</span>
            </a>
            <span className={styles.pagerSep} aria-hidden />
            <a href={localePath(lang, `/${next.slug}`)} aria-label={`${dict.case.next}: ${next.name}`}>
              <span>{next.name}</span>
              <Icon name="chevron-right" size={16} />
            </a>
          </nav>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.heroHead}>
            <h1 id="case-title" className={styles.title}>
              <LaserTitle text={data.title} />
              {data.titleNote && <span className={styles.titleNote}> {data.titleNote}</span>}
            </h1>
            <p className={styles.kind}>{data.kind}</p>
          </div>
          <div className={styles.heroExhibit}>
            <Showcase
              images={data.showcase}
              label={dict.case.showcase}
              labels={{ show: dict.case.show, prev: dict.case.prevShot, next: dict.case.nextShot }}
              caption={data.showcaseCaption}
            />
          </div>
          <div className={styles.heroBody}>
            <p className={styles.subtitle}>{data.subtitle}</p>
            {data.heroNote && <p className={styles.heroNote}>{data.heroNote}</p>}
            {data.ctas.length > 0 && (
              <div className={styles.ctas}>
                {data.ctas.map((link, i) => (
                  <LinkButton key={link.href + i} link={link} primary={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {data.stats.length > 0 && (
        <dl className={styles.stats}>
          {data.stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {data.sections.map((section, i) => (
        <Fragment key={i}>
          <section id={section.id} className={styles.section} aria-labelledby={`s-${i}`} data-lede={section.lede ? undefined : "none"}>
            <header className={styles.sectionHead}>
              <h2 id={`s-${i}`}>{section.title}</h2>
              {section.lede && <p>{section.lede}</p>}
            </header>
            <div className={styles.blocks}>
              {section.blocks.map((block, j) => (
                <BlockView key={j} block={block} />
              ))}
            </div>
          </section>
          {/* The screens beyond the hero hang after the first section, so they are not carousel-only. */}
          {i === 0 && extra.length > 0 && (
            <div className={styles.gallery} data-count={extra.length}>
              {extra.map((img) => (
                <figure key={img.src} className={styles.imageFig}>
                  <div className={styles.imageFrame} style={{ ["--ratio" as string]: img.width / img.height }}>
                    <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 960px) 94vw, 45vw" />
                  </div>
                </figure>
              ))}
            </div>
          )}
        </Fragment>
      ))}

      {data.closing && (
        <section className={styles.closing} aria-labelledby="closing-title">
          <h2 id="closing-title">{data.closing.title}</h2>
          <p>{data.closing.body}</p>
          <div className={styles.ctas}>
            <LinkButton link={data.closing.note ? { label: dict.case.closingCta, href: homeAnchor(lang, "contact") } : data.closing.cta} primary />
            {data.closing.secondary && !data.closing.note && <LinkButton link={data.closing.secondary} />}
          </div>
          {data.closing.note && (
            <div className={styles.capacity}>
              {data.closing.badge && <p className={styles.badge}>{data.closing.badge}</p>}
              <p>{linkify(data.closing.note, [data.closing.cta, data.closing.secondary])}</p>
            </div>
          )}
        </section>
      )}

      <nav className={styles.more} aria-label={dict.case.more}>
        <a href={localePath(lang, `/${prev.slug}`)} className={styles.moreLink}>
          <span className={styles.moreDir}>{dict.case.prev}</span>
          <span className={styles.moreName}>{prev.name}</span>
        </a>
        <a href={localePath(lang, `/${next.slug}`)} className={`${styles.moreLink} ${styles.moreNext}`}>
          <span className={styles.moreDir}>{dict.case.next}</span>
          <span className={styles.moreName}>{next.name}</span>
        </a>
      </nav>
    </main>
  );
}
