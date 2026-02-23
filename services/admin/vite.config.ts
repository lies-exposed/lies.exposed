import { defineEnv } from "@liexp/core/lib/frontend/defineEnv.js";
import { defineViteConfig } from "@liexp/core/lib/frontend/vite/config.js";
import { getGitInfo } from "@liexp/core/lib/git/info.js";
import { generateChunkConfig } from "@liexp/core/lib/frontend/vite/chunk-config.js";
import { reactVirtualized } from "@liexp/ui/lib/vite/plugins/react-virtualized.js";
import * as path from "path";

// Set version env vars if not already set
const gitInfo = getGitInfo();
process.env.VITE_VERSION ??= gitInfo.version;
process.env.VITE_COMMIT_HASH ??= gitInfo.commitHash;

export const AppEnv = defineEnv((Schema) => ({
  VITE_NODE_ENV: Schema.String,
  VITE_PUBLIC_URL: Schema.String,
  VITE_OPENAI_URL: Schema.String,
  VITE_API_URL: Schema.String,
  VITE_WEB_URL: Schema.String,
  VITE_DEBUG: Schema.String,
  VITE_VERSION: Schema.String,
  VITE_COMMIT_HASH: Schema.String,
}));

export const port =
  process.env.VIRTUAL_PORT !== undefined
    ? parseInt(process.env.VIRTUAL_PORT, 10)
    : 80;

/**
 * Manual chunk configuration for optimized code splitting
 * Automatically discovers pages and groups them by semantic folder patterns
 *
 * Folder structure:
 * - pages/actors/* -> chunk-actors
 * - pages/events/* -> chunk-events
 * - pages/areas/* -> chunk-areas
 */
const getRollupOptions = () => {
  const cwd = import.meta.dirname;

  return generateChunkConfig(
    {
      pagesDir: path.join(cwd, "src/pages"),
      chunkPrefix: "chunk-",
      folderToChunkMap: {
        // Custom mappings if needed
        // "events": "chunk-events-detailed",
      },
    },
    cwd,
  );
};

const config = defineViteConfig({
  cwd: import.meta.dirname,
  base: "/",
  env: AppEnv,
  envFileDir: __dirname,
  server: {
    port,
    host: process.env.VIRTUAL_HOST ?? "0.0.0.0",
    hmr: {
      host: process.env.VIRTUAL_HOST ?? "127.0.0.1",
      port: 24679,
      clientPort: 24679,
    },
    allowedHosts:
      process.env.VITE_NODE_ENV === "production"
        ? ["admin.lies.exposed"]
        : ["admin.liexp.dev"],
  },
  output: "build",
  target: "spa",
  entry: "src/index.tsx",
  html: {
    templatePath: "index.html",
  },
  tsConfigFile:
    process.env.VITE_NODE_ENV === "production"
      ? "tsconfig.build.json"
      : "tsconfig.json",
  plugins: [reactVirtualized()],
  rollupOptions: getRollupOptions(),
  // Monorepo HMR is auto-detected and enabled by default in development
  // Set to false to disable: monorepoHmr: false
});

export default config;
