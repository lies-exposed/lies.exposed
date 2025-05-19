import { build } from "esbuild";

await build({
  format: "cjs",
  target: "node20",
  platform: "node",
  bundle: true,
  external: [
    "puppeteer-core",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
  ],
  entryPoints: ["build/run.js"],
  outfile: "./build/run-esbuild.js",
  inject: ["./import-meta-url.js"],
  define: {
    "import.meta.url": "import_meta_url",
  },
});
