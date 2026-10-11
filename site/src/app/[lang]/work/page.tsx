import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import styles from "@/components/page/Page.module.css";
import { PageHero, pageMetadata } from "@/components/page/PageHero";
import { Flagships } from "@/components/sections/Flagships";
import { WorkIndex } from "@/components/sections/WorkIndex";
import { flagships, workIndex } from "@/content/work";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const COUNT = flagships.length + workIndex.length;

export async function generateMetadata({ params }: PageProps<"/[lang]/work">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const p = (await getDictionary(lang)).pages.work;
  return pageMetadata(lang, "/work", p.title, p.description.replace("{count}", String(COUNT)));
}

// Every case study: the three flagships as exhibits, then the full index.
export default async function WorkPage({ params }: PageProps<"/[lang]/work">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} path="/work" />
      <main className={styles.page}>
        <PageHero lang={lang} path="/work" home={dict.pages.home} label={dict.pages.work.label} title={dict.flagships.title} intro={dict.flagships.lede} />
        <Flagships lang={lang} dict={dict} bare />
        <WorkIndex lang={lang} copy={dict.index} />
      </main>
    </>
  );
}
