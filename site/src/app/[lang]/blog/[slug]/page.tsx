import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import styles from "@/components/blog/Blog.module.css";
import { Icon } from "@/components/icons/Icon";
import { author, t } from "@/content/blog-i18n.mjs";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCase } from "@/lib/cases";
import { jsonLdHtml } from "@/lib/jsonld";
import { allPosts, getPost } from "@/lib/posts";
import { breadcrumbLd, seo } from "@/lib/seo";

const SITE = "https://www.lumiverse.hr";
type Copy = { home: string; blog: string; min: string; related: string; relatedCta: string; back: string };

// Unknown slugs wait for the full render so notFound() answers with a real 404.
export const ensureStatic = "navigation";

// Posts live at /blog/<slug>, and their translations at /hr/blog/<slug>.
export async function generateStaticParams() {
  const all = await Promise.all(locales.map(async (lang) => (await allPosts(lang)).filter((p) => p.lang === lang).map((p) => ({ lang, slug: p.slug }))));
  return all.flat();
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const post = await getPost(slug, lang);
  if (!post) return {};
  const m = post.meta;
  return {
    ...seo({
      lang,
      path: `/blog/${slug}`,
      title: `${m.title} | LumiVerse`,
      description: m.description,
      image: m.image,
      langs: m.langs,
      openGraph: {
        type: "article",
        title: m.title,
        publishedTime: m.date,
        modifiedTime: m.updated,
        authors: [author.name],
        tags: m.tags,
      },
    }),
    keywords: m.tags,
  };
}

export default async function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const post = await getPost(slug, lang);
  if (!post) notFound();
  const dict = await getDictionary(lang);
  const s = t[lang] as Copy;
  const m = post.meta;
  const related = (await Promise.all(m.related.map(async (r) => ({ slug: r, data: await getCase(r, lang) })))).filter((r) => r.data);
  const date = new Intl.DateTimeFormat(lang === "hr" ? "hr-HR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: m.title,
    description: m.description,
    datePublished: m.date,
    dateModified: m.updated ?? m.date,
    image: m.image ? `${SITE}${m.image}` : undefined,
    keywords: m.tags.join(", "),
    author: { "@type": "Person", name: author.name, url: author.url },
    publisher: { "@type": "Organization", "@id": `${SITE}/#organization`, name: "LumiVerse d.o.o.", url: SITE },
    inLanguage: lang,
    mainEntityOfPage: `${SITE}${localePath(lang, `/blog/${slug}`)}`,
  };

  return (
    <>
      {/* An untranslated post switches to the other language's blog index. */}
      <Header
        lang={lang}
        dict={dict}
        switchTo={{
          en: localePath("en", `/blog/${slug}`),
          hr: m.langs.includes("hr") ? localePath("hr", `/blog/${slug}`) : localePath("hr", "/blog"),
        }}
      />
      <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml([jsonLd, breadcrumbLd(lang, s.home, [{ name: s.blog, path: "/blog" }, { name: m.title, path: `/blog/${slug}` }])])} />
        <article className={styles.column}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <a href={localePath(lang)}>{s.home}</a>
            <span aria-hidden>/</span>
            <Link href={localePath(lang, "/blog")}>{s.blog}</Link>
          </nav>
          <h1 className={styles.postTitle}>{m.title}</h1>
          <p className={styles.lede}>{m.description}</p>
          <div className={styles.byline}>
            <span className={styles.avatar} aria-hidden>TJ</span>
            <div>
              <a className={styles.author} href={author.url} target="_blank" rel="noopener author">{author.name}</a>
              <span className={styles.bylineMeta}>
                {author.role[lang]} · <time dateTime={m.date}>{date.format(new Date(m.date))}</time> · {m.minutes} {s.min}
              </span>
              {m.tags.length > 0 && <span className={styles.tags}>{m.tags.join(" · ")}</span>}
            </div>
          </div>
          {/* Posts are our own Markdown, rendered at build time. */}
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: post.html }} />
          {related.length > 0 && (
            <aside className={styles.related} aria-label={s.related}>
              <p className={styles.relatedTitle}>{s.related}</p>
              {related.map(({ slug: r, data }) => (
                <a key={r} className={styles.relatedCard} href={localePath(lang, `/${r}`)}>
                  <Image src={`/og/${r}.jpg`} alt="" width={1200} height={630} sizes="200px" />
                  <span>
                    <span className={styles.relatedName}>{data!.title.replace(/\n/g, " ")}</span>
                    <span className={styles.relatedKind}>{data!.kind}</span>
                    <span className={styles.relatedMore}>
                      {s.relatedCta}
                      <Icon name="arrow-right" size={14} />
                    </span>
                  </span>
                </a>
              ))}
            </aside>
          )}
          <Link className={styles.back} href={localePath(lang, "/blog")}>{s.back}</Link>
        </article>
      </main>
    </>
  );
}
