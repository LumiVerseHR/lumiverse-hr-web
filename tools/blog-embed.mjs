// Blog content that lands in pages Astro does not template: the homepage
// "Latest writing" strip and the sitemap. The blog index renders its cards
// with the same postCard(), so a card looks the same everywhere.
import { blogIndexRoute, formatDate, isoDate, readPosts } from "./blog-posts.mjs";

const site = "https://www.lumiverse.hr";

const escape = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const copy = {
  en: { min: "min read", read: "Read the post", langNote: "" },
  hr: { min: "min čitanja", read: "Pročitaj članak", langNote: "Na engleskom" }
};

// `lang` is the language of the page the card sits on. A post in another
// language says so up front instead of surprising the reader after the click.
export function postCard(post, lang, { featured = false } = {}) {
  const t = copy[lang];
  const foreign = post.lang !== lang;
  const langAttr = foreign ? ` lang="${post.lang}"` : "";
  const note = foreign && t.langNote ? `<span class="post-card-lang">${t.langNote}</span>` : "";
  return `<a class="post-card${featured ? " post-card-featured" : ""}" href="${post.route}">
            <span class="post-card-meta">
              <time datetime="${isoDate(post.date)}">${formatDate(post.date, lang)}</time>
              <span aria-hidden="true">&middot;</span>
              <span>${post.minutes} ${t.min}</span>
              ${note}
            </span>
            <h3 class="post-card-title"${langAttr}>${escape(post.title)}</h3>
            <p class="post-card-excerpt"${langAttr}>${escape(post.description)}</p>
            <span class="post-card-more">${t.read} <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
          </a>`;
}

// The Croatian tree has few posts of its own yet, so it lists its own first
// and fills the rest with English ones rather than showing an empty page.
export function postsFor(lang, posts = readPosts()) {
  const own = posts.filter((post) => post.lang === lang);
  const other = posts.filter((post) => post.lang !== lang && post.lang === "en");
  return lang === "en" ? own : [...own, ...other];
}

const homepages = { "index.html": "en", "hr/index.html": "hr" };
const MARKER = "<!-- blog:latest -->";

export function latestStrip(page, html) {
  const lang = homepages[page];
  if (!lang || !html.includes(MARKER)) return html;
  const cards = postsFor(lang).slice(0, 3).map((post) => postCard(post, lang));
  return html.replace(MARKER, cards.join("\n          "));
}

export function sitemapEntries(xml) {
  const posts = readPosts();
  const latest = (list) => isoDate(list.reduce((max, p) => ((p.updated ?? p.date) > max ? p.updated ?? p.date : max), list[0].updated ?? list[0].date));
  const entry = (route, lastmod, changefreq, priority) => `  <url>
    <loc>${site}${route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  if (!posts.length) return xml;
  let block = "\n  <!-- Blog (generated from src/content/blog by the migrate step) -->\n";
  for (const lang of ["en", "hr"]) {
    const listed = postsFor(lang, posts);
    if (listed.length) block += entry(blogIndexRoute(lang), latest(listed), "weekly", "0.7");
  }
  for (const post of posts) block += entry(post.route, isoDate(post.updated ?? post.date), "monthly", "0.6");
  return xml.replace("</urlset>", `${block}</urlset>`);
}
