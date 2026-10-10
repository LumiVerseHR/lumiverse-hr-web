import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { allPosts, latestPosts } from "@/lib/posts";
import { Icon } from "@/components/icons/Icon";
import s from "./sections.module.css";
import styles from "./Notes.module.css";

// The latest three posts; with `tags`, every post carrying one of them, under its own `title`.
export async function Notes({ lang, dict, tags, title }: { lang: Locale; dict: Dictionary; tags?: string[]; title?: string }) {
  const posts = tags ? (await allPosts()).filter((post) => post.tags.some((tag) => tags.includes(tag))) : await latestPosts(3);
  const date = new Intl.DateTimeFormat(lang === "hr" ? "hr-HR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section id={tags ? undefined : "blog"} className={s.section} aria-labelledby="notes-title">
      <div className={s.inner}>
        <header className={`${s.head} ${styles.head}`}>
          <h2 id="notes-title" className={s.title}>{title ?? dict.notes.title}</h2>
          <Link href="/blog" className={s.arrowLink}>
            {dict.notes.all}
            <Icon name="arrow-right" size={16} />
          </Link>
        </header>
        <ol className={styles.posts}>
          {posts.map((post) => (
            <li key={post.slug}>
              <a href={`/blog/${post.slug}`} className={styles.post} hrefLang="en" lang="en">
                <span className={styles.meta}>
                  <time dateTime={post.date}>{date.format(new Date(post.date))}</time>
                  <span aria-hidden> · </span>
                  {post.minutes} {dict.notes.read}
                  {dict.notes.langNote && <span className={styles.lang} lang={lang}> · {dict.notes.langNote}</span>}
                </span>
                <span className={styles.title}>{post.title}</span>
                <span className={styles.description}>{post.description}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
