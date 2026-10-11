import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/Header";
import styles from "@/components/blog/Blog.module.css";
import { t } from "@/content/blog-i18n.mjs";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { allPosts } from "@/lib/posts";

type Copy = { indexTitle: string; indexDescription: string; home: string; blog: string; heading: string[]; intro: string; min: string; rss: string; empty: string; langNote: string };

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const s = t[lang] as Copy;
  return {
    title: s.indexTitle,
    description: s.indexDescription,
    alternates: { canonical: localePath(lang, "/blog"), languages: { en: "/blog", hr: "/hr/blog" }, types: { "application/rss+xml": "/blog/rss.xml" } },
  };
}

export default async function BlogIndex({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = t[lang] as Copy;
  const posts = await allPosts(lang);
  const date = new Intl.DateTimeFormat(lang === "hr" ? "hr-HR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Header lang={lang} dict={dict} path="/blog" />
      <main className={styles.page}>
        <div className={styles.wrap}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <a href={localePath(lang)}>{s.home}</a>
            <span aria-hidden>/</span>
            <span aria-current="page">{s.blog}</span>
          </nav>
          <h1 className={styles.title}>{s.heading.join(" ")}</h1>
          <p className={styles.intro}>{s.intro}</p>
          <a className={styles.rss} href="/blog/rss.xml">{s.rss}</a>
          {posts.length === 0 ? (
            <p className={styles.intro}>{s.empty}</p>
          ) : (
            <ol className={styles.list}>
              {posts.map((post) => (
                <li key={post.slug}>
                  <a
                    className={styles.item}
                    href={localePath(post.lang, `/blog/${post.slug}`)}
                    hrefLang={post.lang === lang ? undefined : post.lang}
                  >
                    <span className={styles.meta}>
                      <time dateTime={post.date}>{date.format(new Date(post.date))}</time>
                      <br />
                      {post.minutes} {s.min}
                      {post.lang !== lang && s.langNote && (
                        <>
                          <br />
                          <span className={styles.langNote}>{s.langNote}</span>
                        </>
                      )}
                    </span>
                    <span className={styles.itemBody} lang={post.lang === lang ? undefined : post.lang}>
                      <span className={styles.itemTitle}>{post.title}</span>
                      <span className={styles.itemDesc}>{post.description}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </>
  );
}
