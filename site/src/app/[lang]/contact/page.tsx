import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import styles from "@/components/page/Page.module.css";
import { PageHero, pageMetadata } from "@/components/page/PageHero";
import { Contact } from "@/components/sections/Contact";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const p = (await getDictionary(lang)).pages.contact;
  return pageMetadata(lang, "/contact", p.title, p.description);
}

// The brief. A package's order button links here with ?package=<id>; the form preselects it.
export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} path="/contact" />
      <main className={styles.page}>
        <PageHero lang={lang} path="/contact" home={dict.pages.home} label={dict.pages.contact.label} title={dict.contact.title} intro={dict.contact.lede} />
        <Contact lang={lang} dict={dict} bare />
      </main>
    </>
  );
}
