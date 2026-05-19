import { defineConfig } from "astro/config";

/**
 * Default: local dev + merge-gate CI (site root at /).
 * GitHub Pages project site: set in deploy workflow only:
 *   ASTRO_BASE_PATH=/caesar-ai-regulation-watch/
 *   ASTRO_SITE=https://caesar-compliance.github.io
 * Custom domain (regulations.caesar.no) is deferred — no DNS in v0.8.4.
 */
const basePath = process.env.ASTRO_BASE_PATH?.replace(/\/?$/, "/") || undefined;
const site = process.env.ASTRO_SITE || "https://regulations.caesar.no";

export default defineConfig({
  site,
  ...(basePath ? { base: basePath } : {}),
  output: "static",
  srcDir: "src",
  outDir: "dist",
  build: {
    format: "directory",
  },
});
