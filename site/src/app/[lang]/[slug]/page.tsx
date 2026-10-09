import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case/CaseStudy";
import { Header } from "@/components/chrome/Header";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { caseSlugs, getCase } from "@/lib/cases";

// Unknown slugs must wait for the full render so notFound() can answer with a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const slugs = await caseSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const data = await getCase(slug, lang);
  if (!data) return {};
  const og = data.meta.ogImage ?? `/og/${slug}.jpg`;
  return {
    title: data.meta.title,
    description: data.meta.description,
    alternates: {
      canonical: localePath(lang, `/${slug}`),
      languages: { en: localePath("en", `/${slug}`), hr: localePath("hr", `/${slug}`) },
    },
    openGraph: { title: data.meta.title, description: data.meta.description, images: [og], type: "article" },
  };
}

export default async function CasePage({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const data = await getCase(slug, lang);
  if (!data) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} path={`/${slug}`} />
      <CaseStudy data={data} lang={lang} dict={dict} />
    </>
  );
}
