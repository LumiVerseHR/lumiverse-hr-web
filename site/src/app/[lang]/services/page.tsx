import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import styles from "@/components/page/Page.module.css";
import { PageHero, pageMetadata } from "@/components/page/PageHero";
import { Contact } from "@/components/sections/Contact";
import { Services } from "@/components/sections/Services";
import { Thesis } from "@/components/sections/Thesis";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const p = (await getDictionary(lang)).pages.services;
  return pageMetadata(lang, "/services", p.title, p.description);
}

// How we work together: the three ways in, then upskilling, then the brief.
export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} path="/services" />
      <main className={styles.page}>
        <PageHero lang={lang} path="/services" home={dict.pages.home} label={dict.pages.services.label} title={dict.services.title} intro={dict.services.lede} />
        <Services lang={lang} dict={dict} bare doors={false} more={null} />
        <Services
          lang={lang}
          dict={dict}
          ids={["ai-team-workshop", "ai-team-rollout"]}
          heading={dict.services.upskillTitle}
        />
        <Thesis lang={lang} dict={dict} />
        <Contact lang={lang} dict={dict} />
      </main>
    </>
  );
}
