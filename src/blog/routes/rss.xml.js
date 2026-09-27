// /blog/rss.xml — every published post, both languages, newest first.
// Hand-rolled rather than @astrojs/rss: it is thirty lines and one less
// dependency to keep current.
import { allPosts } from "../posts.mjs";
import { author, t } from "../i18n.mjs";

const site = "https://www.lumiverse.hr";

const escape = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = await allPosts();
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${site}${post.route}</link>
      <guid isPermaLink="true">${site}${post.route}</guid>
      <description>${escape(post.description)}</description>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <dc:creator>${escape(author.name)}</dc:creator>
      <dc:language>${post.lang}</dc:language>
${post.tags.map((tag) => `      <category>${escape(tag)}</category>`).join("\n")}
    </item>`
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>LumiVerse Blog</title>
    <link>${site}/blog</link>
    <description>${escape(t.en.intro)}</description>
    <language>en</language>
    <atom:link href="${site}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${posts.length ? `    <lastBuildDate>${posts[0].date.toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
