import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { inGroup } from "@/content/packages.mjs";
import { form } from "@/content/pricing-i18n.mjs";
import { ContactForm } from "./ContactForm";
import s from "./sections.module.css";
import styles from "./Contact.module.css";

type Pkg = { id: string; en: { name: string }; hr: { name: string } };
const GROUPS = [["engagement", "engagements"], ["upskill", "upskill"], ["system", "systems"]] as const;

export function Contact({ lang, dict, preset }: { lang: Locale; dict: Dictionary; preset?: string }) {
  const c = dict.contact;
  const f = form[lang] as Record<string, string>;
  const groups = GROUPS.map(([group, label]) => ({
    label: f[label],
    items: (inGroup(group) as Pkg[]).map((p) => ({ id: p.id, name: p[lang].name })),
  }));

  return (
    <section id="contact" className={`${s.section} ${s.wallLight}`} aria-labelledby="contact-title">
      <div className={`${s.inner} ${styles.layout}`}>
        <div>
          <h2 id="contact-title" className={s.title}>{c.title}</h2>
          <p className={s.lede}>{c.lede}</p>
          <dl className={styles.details}>
            <div>
              <dt>{c.office}</dt>
              <dd>
                LumiVerse d.o.o.
                <br />
                Markuševečka cesta 20C, 10000 Zagreb
              </dd>
            </div>
            <div>
              <dt>{c.emailLabel}</dt>
              <dd>
                <a href="mailto:info@lumiverse.hr">info@lumiverse.hr</a>
              </dd>
            </div>
            <div>
              <dt>{c.phone}</dt>
              <dd>
                <a href="tel:+385959119947">+385 95 911 99 47</a>
              </dd>
            </div>
            <div>
              <dt>{c.vat}</dt>
              <dd>HR88595646800</dd>
            </div>
          </dl>
        </div>
        <ContactForm lang={lang} copy={c} groups={groups} preset={preset} />
      </div>
    </section>
  );
}
