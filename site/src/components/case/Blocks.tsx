import Image from "next/image";
import type { Block } from "@/content/case-schema";
import { Figure } from "@/components/icons/Figure";
import { Icon } from "@/components/icons/Icon";
import { Rich } from "./Rich";
import styles from "./CaseStudy.module.css";

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <div className={styles.text}>
          {block.paragraphs.map((p, i) => (
            <Rich key={i} text={p} />
          ))}
        </div>
      );
    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((item, i) => (
            <li key={i}>
              {item.title && <strong>{item.title}</strong>}
              <Rich text={item.body} />
            </li>
          ))}
        </ul>
      );
    case "cards":
      return (
        <div className={styles.cards}>
          {block.items.map((item, i) => (
            <article key={i} className={styles.card}>
              {item.meta && <p className={styles.cardMeta}>{item.meta}</p>}
              <h3>{item.title}</h3>
              <Rich text={item.body} />
            </article>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className={styles.steps}>
          {block.items.map((item, i) => (
            <li key={i}>
              <span className={styles.stepNo} aria-hidden>
                {item.label ?? String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{item.title}</h3>
                <Rich text={item.body} />
              </div>
            </li>
          ))}
        </ol>
      );
    case "images":
      return (
        <div className={styles.images} data-count={block.items.length}>
          {block.items.map((img) => (
            <figure key={img.src} className={styles.imageFig}>
              <div className={styles.imageFrame}>
                <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 900px) 94vw, 900px" />
              </div>
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    case "quote":
      return (
        <figure className={styles.quote}>
          <Figure height={44} />
          <blockquote>
            <Rich text={block.text} />
          </blockquote>
          {block.cite && <figcaption>{block.cite}</figcaption>}
        </figure>
      );
    case "table":
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            {block.caption && <caption>{block.caption}</caption>}
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "plans":
      return (
        <div className={styles.plans}>
          {block.items.map((plan, i) => (
            <article key={i} className={styles.plan}>
              <h3>{plan.name}</h3>
              <p className={styles.price}>
                <span>{plan.price}</span>
                {plan.period && <small>{plan.period}</small>}
              </p>
              <ul>
                {plan.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
              {plan.note && <p className={styles.planNote}>{plan.note}</p>}
              {plan.cta && (
                <a className={styles.planCta} href={plan.cta.href} {...(plan.cta.external ? { target: "_blank", rel: "noopener" } : {})}>
                  {plan.cta.label}
                  <Icon name="arrow-right" size={16} />
                </a>
              )}
            </article>
          ))}
        </div>
      );
  }
}
