import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.lumiverse.hr",
  output: "static",
  build: {
    format: "file"
  },
  trailingSlash: "never"
});
