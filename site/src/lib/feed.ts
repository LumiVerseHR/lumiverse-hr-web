import { author, t } from "@/content/blog-i18n.mjs";
import { localePath, type Locale } from "@/i18n/config";
import { allPosts } from "@/lib/posts";

const SITE = "https://www.lumiverse.hr";
const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// One language's feed: every published post, newest first; the Croatian feed carries an
// untranslated post in English, as the Croatian blog does.
export async function feed(lang: Locale) {
  const posts = await allPosts(lang);
  const blog = `${SITE}${localePath(lang, "/blog")}`;
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${SITE}${localePath(post.lang, `/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${SITE}${localePath(post.lang, `/blog/${post.slug}`)}</guid>
      <description>${escape(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator>${escape(author.name)}</dc:creator>
      <dc:language>${post.lang}</dc:language>
${post.tags.map((tag) => `      <category>${escape(tag)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${lang === "hr" ? "LumiVerse blog" : "LumiVerse Blog"}</title>
    <link>${blog}</link>
    <description>${escape(t[lang].intro)}</description>
    <language>${lang}</language>
    <atom:link href="${blog}/rss.xml" rel="self" type="application/rss+xml"/>
${posts.length ? `    <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
