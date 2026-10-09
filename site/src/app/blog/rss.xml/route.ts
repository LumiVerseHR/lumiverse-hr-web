import { author, t } from "@/content/blog-i18n.mjs";
import { allPosts } from "@/lib/posts";

const SITE = "https://www.lumiverse.hr";
const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// /blog/rss.xml: every published post, newest first (same feed as the legacy site).
export async function GET() {
  const posts = await allPosts();
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${SITE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${post.slug}</guid>
      <description>${escape(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator>${escape(author.name)}</dc:creator>
      <dc:language>en</dc:language>
${post.tags.map((tag) => `      <category>${escape(tag)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>LumiVerse Blog</title>
    <link>${SITE}/blog</link>
    <description>${escape(t.en.intro)}</description>
    <language>en</language>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${posts.length ? `    <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
