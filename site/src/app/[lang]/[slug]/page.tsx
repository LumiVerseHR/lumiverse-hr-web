import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case/CaseStudy";
import { Header } from "@/components/chrome/Header";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { caseSlugs, getCase } from "@/lib/cases";
import { breadcrumbLd, seo, SITE } from "@/lib/seo";
import { jsonLdHtml } from "@/lib/jsonld";

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
  return seo({ lang, path: `/${slug}`, title: data.meta.title, description: data.meta.description, image: og, openGraph: { type: "article" } });
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml([
          breadcrumbLd(lang, dict.pages.home, [
            { name: dict.pages.work.label, path: "/work" },
            { name: data.title.replace(/\n/g, " "), path: `/${slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: data.title.replace(/\n/g, " "),
            headline: data.meta.title,
            description: data.meta.description,
            genre: data.kind,
            inLanguage: lang,
            url: `${SITE}${localePath(lang, `/${slug}`)}`,
            image: `${SITE}${data.meta.ogImage ?? `/og/${slug}.jpg`}`,
            creator: { "@id": `${SITE}/#organization` },
          },
        ])}
      />
      <CaseStudy data={data} lang={lang} dict={dict} />
    </>
  );
}
