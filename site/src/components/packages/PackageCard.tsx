import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import { priceParts } from "@/content/packages.mjs";
import { Icon } from "@/components/icons/Icon";
import pricing from "@/components/pricing/Pricing.module.css";
import { coverOf, type Work } from "./PackageWork";
import styles from "./Packages.module.css";

type Copy = { name: string; summary: string; includes: string[]; tag?: string; priceNote?: string };
export type Packaged = {
  id: string;
  price: Record<string, unknown>;
  pack: { delivery: Record<Locale, string>; work?: Work[] };
  en: Copy;
  hr: Copy;
};
type Labels = { delivery: string; more: string; order: string };

// A package as a placard: a still of work it's been proven on, name, the one price, how long it takes, the first few inclusions,
// and two ways on: its own page, or straight to the order.
export function PackageCard({ pkg, lang, labels, compact = false }: { pkg: Packaged; lang: Locale; labels: Labels; compact?: boolean }) {
  const c = pkg[lang];
  const p = priceParts(pkg.price, lang) as { lead: string; amount: string; unit: string };
  const page = localePath(lang, `/packages/${pkg.id}`);
  const cover = coverOf(pkg.pack.work);
  return (
    <article className={`${pricing.card} ${styles.card}`} id={pkg.id}>
      {cover && (
        <a href={page} className={styles.cover} tabIndex={-1} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- a small fixed poster */}
          <img src={cover.poster} alt="" loading="lazy" width={640} height={400} />
        </a>
      )}
      <h3 className={pricing.name}>
        <a href={page} className={styles.nameLink}>{c.name}</a>
      </h3>
      {c.tag && <p className={pricing.tag}>{c.tag}</p>}
      <p className={pricing.summary}>{c.summary}</p>
      <p className={pricing.price}>
        {p.lead && <span className={pricing.lead}>{p.lead}</span>}
        <span className={pricing.amount}>{p.amount}</span>
        <span className={pricing.unit}>{p.unit}</span>
      </p>
      <p className={styles.delivery}>
        {labels.delivery}: {pkg.pack.delivery[lang]}
      </p>
      {!compact && (
        <ul className={pricing.includes}>
          {c.includes.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      <div className={styles.actions}>
        <a href={page} className={styles.more}>
          {labels.more}
        </a>
        <a href={`${localePath(lang, "/contact")}?package=${pkg.id}`} className={styles.order}>
          {labels.order}
          <Icon name="arrow-right" size={16} />
        </a>
      </div>
    </article>
  );
}
