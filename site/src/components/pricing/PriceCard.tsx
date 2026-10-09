import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import { priceParts } from "@/content/packages.mjs";
import { Icon } from "@/components/icons/Icon";
import { PickPackage } from "./PickPackage";
import styles from "./Pricing.module.css";

type Copy = { name: string; summary: string; includes: string[]; proof?: string; cta: string; tag?: string; priceNote?: string };
export type Pkg = { id: string; group: string; price: Record<string, unknown>; proof?: string; en: Copy; hr: Copy };

// One package as a black placard: name, the floor price, what's included, and the proof it rests on.
export function PriceCard({ pkg, lang }: { pkg: Pkg; lang: Locale }) {
  const c = pkg[lang];
  const p = priceParts(pkg.price, lang) as { lead: string; amount: string; unit: string; then: string };
  return (
    <article className={styles.card} id={pkg.id}>
      {c.tag && <p className={styles.tag}>{c.tag}</p>}
      <h3 className={styles.name}>{c.name}</h3>
      <p className={styles.summary}>{c.summary}</p>
      <p className={styles.price}>
        {p.lead && <span className={styles.lead}>{p.lead}</span>}
        <span className={styles.amount}>{p.amount}</span>
        <span className={styles.unit}>{p.unit}</span>
      </p>
      {p.then && <p className={styles.then}>{p.then}</p>}
      {c.priceNote && <p className={styles.note}>{c.priceNote}</p>}
      <ul className={styles.includes}>
        {c.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {pkg.proof && c.proof && (
        <a className={styles.proof} href={localePath(lang, `/${pkg.proof}`)}>
          {c.proof}
        </a>
      )}
      <PickPackage id={pkg.id} className={styles.cta}>
        {c.cta}
        <Icon name="arrow-right" size={16} />
      </PickPackage>
    </article>
  );
}
