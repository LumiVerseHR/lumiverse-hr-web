import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import styles from "@/components/page/Page.module.css";
import { PageHero, pageMetadata } from "@/components/page/PageHero";
import s from "@/components/sections/sections.module.css";
import { Notes } from "@/components/sections/Notes";
import { Studio } from "@/components/sections/Studio";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/studio">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const p = (await getDictionary(lang)).pages.studio;
  return pageMetadata(lang, "/studio", p.title, p.description);
}

// Who we are: the studio and its principles, the company behind it, and what we're writing.
export default async function StudioPage({ params }: PageProps<"/[lang]/studio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const p = dict.pages.studio;
  return (
    <>
      <Header lang={lang} dict={dict} path="/studio" />
      <main className={styles.page}>
        <PageHero lang={lang} path="/studio" home={dict.pages.home} label={p.label} title={dict.studio.title} />
        <Studio dict={dict} bare />
        <section className={s.section} aria-labelledby="company-title">
          <div className={s.inner}>
            <h2 id="company-title" className={styles.factsTitle}>{p.company}</h2>
            <dl className={styles.facts}>
              <div>
                <dt>{p.name}</dt>
                <dd>LumiVerse d.o.o.</dd>
              </div>
              <div>
                <dt>{p.address}</dt>
                <dd>Markuševečka cesta 20C, 10000 Zagreb</dd>
              </div>
              <div>
                <dt>{p.oib}</dt>
                <dd>88595646800</dd>
              </div>
              <div>
                <dt>{p.court}</dt>
                <dd>081511108</dd>
              </div>
              <div>
                <dt>{dict.contact.emailLabel}</dt>
                <dd>
                  <a href="mailto:info@lumiverse.hr">info@lumiverse.hr</a>
                </dd>
              </div>
            </dl>
          </div>
        </section>
        <Notes lang={lang} dict={dict} />
      </main>
    </>
  );
}
