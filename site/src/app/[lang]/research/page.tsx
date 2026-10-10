import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import styles from "@/components/page/Page.module.css";
import { PageHero, pageMetadata } from "@/components/page/PageHero";
import { Flagships } from "@/components/sections/Flagships";
import { Notes } from "@/components/sections/Notes";
import { Thesis } from "@/components/sections/Thesis";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

// Posts that report on method rather than a client build.
const RESEARCH_TAGS = ["AI Evaluation", "AI Quality", "Agentic Engineering"];

export async function generateMetadata({ params }: PageProps<"/[lang]/research">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const p = (await getDictionary(lang)).pages.research;
  return pageMetadata(lang, "/research", p.title, p.description);
}

export default async function ResearchPage({ params }: PageProps<"/[lang]/research">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const p = dict.pages.research;
  return (
    <>
      <Header lang={lang} dict={dict} path="/research" />
      <main className={styles.page}>
        <PageHero lang={lang} path="/research" home={dict.pages.home} label={p.label} title={p.heading} intro={p.intro} />
        <Flagships lang={lang} dict={dict} bare only={["air-laser"]} />
        <Thesis lang={lang} dict={dict} />
        <Notes lang={lang} dict={dict} tags={RESEARCH_TAGS} title={p.notesTitle} />
      </main>
    </>
  );
}
