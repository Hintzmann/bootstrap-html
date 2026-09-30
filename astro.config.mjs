// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// SITE is the origin. BASE is the path prefix (GitHub project pages).
const site = process.env.SITE ?? "http://localhost:4321";
const base = process.env.BASE ?? "/";

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [
    sitemap(),
  ],
  // Astro 7 defaults to compressHTML: "jsx", which strips the newline
  // before inline tags so a wrapped "on <a>" becomes "onComposed". HTML
  // compact keeps that space the way a browser would.
  compressHTML: true,
  redirects: {
    "/components/validation": "/forms/validation",
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [path.join(dirname, "node_modules")],
          silenceDeprecations: [
            "import",
            "global-builtin",
            "color-functions",
            "if-function",
          ],
        },
      },
    },
  },
});
