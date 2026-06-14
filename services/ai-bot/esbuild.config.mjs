import { build } from "esbuild";

await build({
  format: "cjs",
  target: "node24",
  platform: "node",
  bundle: true,
  external: [
    "puppeteer-core",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    // Optional native peer dep of linkedom (pulled in via URLMetadata.provider).
    // Never instantiated on our HTML-parsing path; externalize so esbuild does
    // not try to resolve the unbuilt canvas.node binary.
    "canvas",
  ],
  entryPoints: ["build/run.js"],
  outfile: "./build/run-esbuild.cjs",
  inject: ["./import-meta-url.js"],
  define: {
    "import.meta.url": "import_meta_url",
  },
});
