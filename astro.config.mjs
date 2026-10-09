import { defineConfig } from "astro/config";

// The hand-written pages are copied into src/pages by the migrate step, which
// empties that directory first. The blog and the pricing page are real Astro,
// so their routes live in src/blog/routes and src/pricing/routes and are
// injected here instead — out of reach of the reset.
const astroRoutes = {
  name: "lumiverse-routes",
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
      // Pricing renders from src/pricing/packages.mjs, like the blog from its posts.
      injectRoute({ pattern: "/pricing", entrypoint: "./src/pricing/routes/pricing-en.astro" });
      injectRoute({ pattern: "/hr/pricing", entrypoint: "./src/pricing/routes/pricing-hr.astro" });
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
  integrations: [astroRoutes],
  markdown: {
    // Zero client JS: highlighted at build time, coloured by the theme's own
    // inline styles so it needs nothing from styles.css.
    shikiConfig: { theme: "github-dark-dimmed", wrap: false }
  }
});
