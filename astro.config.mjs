import { defineConfig } from "astro/config";

// The hand-written pages are copied into src/pages by the migrate step, which
// empties that directory first. The blog is real Astro, so its routes live in
// src/blog/routes and are injected here instead — out of reach of the reset.
const blogRoutes = {
  name: "lumiverse-blog",
  hooks: {
    "astro:config:setup": ({ injectRoute }) => {
      const routes = [
        ["/blog", "index-en.astro"],
        ["/hr/blog", "index-hr.astro"],
        ["/blog/[slug]", "post-en.astro"],
        ["/hr/blog/[slug]", "post-hr.astro"],
        ["/blog/rss.xml", "rss.xml.js"]
      ];
      for (const [pattern, file] of routes) {
        injectRoute({ pattern, entrypoint: `./src/blog/routes/${file}` });
      }
    }
  }
};

export default defineConfig({
  site: "https://www.lumiverse.hr",
  output: "static",
  build: {
    format: "file"
  },
  trailingSlash: "never",
  integrations: [blogRoutes],
  markdown: {
    // Zero client JS: highlighted at build time, coloured by the theme's own
    // inline styles so it needs nothing from styles.css.
    shikiConfig: { theme: "github-dark-dimmed", wrap: false }
  }
});
