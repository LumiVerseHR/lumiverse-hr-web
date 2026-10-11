import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import { packaged } from "@/content/packages.mjs";
import { packagesCopy } from "@/content/pricing-i18n.mjs";
import { Icon } from "@/components/icons/Icon";
import pricing from "@/components/pricing/Pricing.module.css";
import s from "@/components/sections/sections.module.css";
import { PackageCard, type Packaged } from "./PackageCard";

// Three packages and the way to the rest, on the homepage and the pricing page.
export function PackagesTeaser({ lang, ids, pricingPage = false }: { lang: Locale; ids: string[]; pricingPage?: boolean }) {
  const c = packagesCopy[lang];
  const shown = ids.map((id) => (packaged as Packaged[]).find((p) => p.id === id)).filter((p): p is Packaged => Boolean(p));
  const cards = (
    <div className={pricing.grid}>
      {shown.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} lang={lang} labels={c} compact />
      ))}
    </div>
  );
  const link = (
    <a href={localePath(lang, "/packages")} className={s.arrowLink} style={{ marginTop: "clamp(32px, 3vw, 48px)" }}>
      {c.teaserLink}
      <Icon name="arrow-right" size={16} />
    </a>
  );
  if (pricingPage) {
    return (
      <section id="packages" className={pricing.group} aria-labelledby="packages-title">
        <header className={pricing.groupHead}>
          <h2 id="packages-title">{c.teaserTitle}</h2>
          <p>{c.intro}</p>
        </header>
        {cards}
        {link}
      </section>
    );
  }
  return (
    <section id="packages" className={s.section} aria-labelledby="packages-title">
      <div className={s.inner}>
        <header className={s.head}>
          <h2 id="packages-title" className={s.title}>{c.heading}</h2>
          <p className={s.lede}>{c.intro}</p>
        </header>
        {cards}
        {link}
      </div>
    </section>
  );
}
