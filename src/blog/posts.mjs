// Collection access for the blog routes: one shape per post, whichever page
// asks for it, so the index, the post page and the feed agree.
import { getCollection } from "astro:content";
import { postRoute, readingMinutes } from "../../tools/blog-posts.mjs";

export async function allPosts() {
  const entries = await getCollection("blog", (entry) => !entry.data.draft);
  return entries
    .map((entry) => {
      const [lang, slug] = entry.id.split("/");
      return {
        entry,
        lang,
        slug,
        route: postRoute(lang, slug),
        ...entry.data,
        minutes: readingMinutes(entry.body ?? "")
      };
    })
    .sort((a, b) => b.date - a.date);
}

export async function postsIn(lang) {
  return (await allPosts()).filter((post) => post.lang === lang);
}

// The same post in the other language, if translationOf names one that exists
// (in either direction), so the pair can point at each other.
export async function translationFor(post) {
  const other = (await allPosts()).filter((candidate) => candidate.lang !== post.lang);
  return (
    other.find((candidate) => candidate.slug === post.translationOf) ??
    other.find((candidate) => candidate.translationOf === post.slug) ??
    null
  );
}
