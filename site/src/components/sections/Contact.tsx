import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { packages } from "@/content/packages.mjs";
import { ContactForm } from "./ContactForm";
import s from "./sections.module.css";
import styles from "./Contact.module.css";

type Pkg = { id: string; en: { name: string }; hr: { name: string } };

export function Contact({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const c = dict.contact;
  const options = (packages as Pkg[]).map((p) => ({ id: p.id, name: p[lang].name }));

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
        <ContactForm lang={lang} copy={c} options={options} />
      </div>
    </section>
  );
}
