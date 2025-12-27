import { build } from "esbuild";

await build({
  format: "cjs",
  target: "node24",
  platform: "node",
  bundle: true,
  external: [
    // Browser automation
    "puppeteer-core",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    // Native modules
    "pg-native",
    "canvas",
    // DOM parsing
    "jsdom",
    // TypeORM CLI and metadata
    "typeorm",
    "@redis/client",
  ],
  entryPoints: ["build/run.js"],
  outfile: "./build/run-esbuild.cjs",
  inject: ["./import-meta-url.js"],
  define: {
    "import.meta.url": "import_meta_url",
  },
});
