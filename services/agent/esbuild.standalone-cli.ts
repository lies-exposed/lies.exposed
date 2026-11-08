import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, "build/standalone-cli");
const outFile = path.join(outDir, "liexp-cli.cjs");
const srcDir = path.resolve(__dirname, "src");

// Ensure output directory exists
fs.mkdirSync(outDir, { recursive: true });

// Resolve `#cli/*` and `#io/*` subpath imports to their TypeScript source.
// These imports normally resolve to `./build/cli/*` and `./build/io/*` (compiled JS),
// but esbuild needs the .ts source files to bundle them.
const subpathAliases: Record<string, string> = {
  "#cli/": "cli/",
  "#io/": "io/",
};

await esbuild.build({
  entryPoints: [path.resolve(__dirname, "src/cli/standalone-cli.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: ["node20.0.0"],
  outfile: outFile,
  external: [],
  treeShaking: true,
  metafile: true,
  logLevel: "info",
  banner: {
    js: "#!/usr/bin/env node\n",
  },
  plugins: [
    {
      name: "resolve-subpath-imports",
      setup(build) {
        // Resolve #cli/* → src/cli/*
        // Resolve #io/* → src/io/*
        for (const [subpath, resolved] of Object.entries(subpathAliases)) {
          build.onResolve({ filter: new RegExp(`^${subpath.replace("*", ".+")}$`) }, (args) => {
            const fileName = args.path.replace(subpath, "");
            return {
              path: path.resolve(srcDir, resolved, fileName),
              namespace: "file",
            };
          });
        }

        // The standalone CLI reads API_BASE_URL and API_TOKEN from env
        // at runtime; ensure these are available in the bundled output
        build.onResolve({ filter: /^process$/ }, () => ({
          external: true,
        }));
      },
    },
  ],
});

// Make the output executable
fs.chmodSync(outFile, 0o755);

console.log(`✓ Bundled standalone CLI to ${outFile}`);
