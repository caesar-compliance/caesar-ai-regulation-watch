import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://regulations.caesar.no",
  output: "static",
  srcDir: "src",
  outDir: "dist",
  build: {
    format: "directory",
  },
});
