// Blog posts: src/content/blog/<lang>/<slug>.md
//
// The schema is the first quality gate. A post that would fail test:seo — a
// title that truncates in search, a stub description — fails here instead,
// at build time, with the file name in the error.
import { existsSync } from "node:fs";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// <title> is "<title> | LumiVerse" unless seoTitle overrides it; test:seo
// wants 30-65 characters for whichever one ends up in the tag.
const SUFFIX = " | LumiVerse";

const blog = defineCollection({
  loader: glob({ pattern: "{en,hr}/*.md", base: "./src/content/blog" }),
  schema: z
    .object({
      title: z.string().min(10).max(90),
      seoTitle: z.string().min(30).max(65).optional(),
      description: z.string().min(110).max(165),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).max(4).default([]),
      // A case-study slug ("rentalica"), linked at the foot of the post.
      related: z
        .array(z.string().refine((slug) => existsSync(`${slug}.html`), "no such case study page"))
        .default([]),
      // An og image under /images, defaulting to the site card.
      image: z
        .string()
        .regex(/^\/images\/.+\.(jpe?g|png)$/)
        .refine((src) => existsSync(src.slice(1)), "image not found")
        .default("/images/og/index.jpg"),
      // Slug of the same post in the other language, when there is one.
      translationOf: z.string().optional(),
      draft: z.boolean().default(false)
    })
    .refine((post) => post.seoTitle || (post.title + SUFFIX).length <= 65, {
      message: `title + "${SUFFIX}" is over 65 characters; shorten it or set seoTitle`
    })
});

export const collections = { blog };
