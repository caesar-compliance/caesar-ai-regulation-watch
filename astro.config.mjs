import { defineConfig } from "astro/config";

/**
 * Default: local dev + merge-gate CI (site root at /).
 * Custom domain (production): ASTRO_SITE=https://regulation-watch.caesar.no
 * Legacy GitHub Pages project path: ASTRO_BASE_PATH=/caesar-ai-regulation-watch/
 *   ASTRO_SITE=https://caesar-compliance.github.io (build:pages only)
 */
const basePath = process.env.ASTRO_BASE_PATH?.replace(/\/?$/, "/") || undefined;
const site = process.env.ASTRO_SITE || "https://regulation-watch.caesar.no";

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
