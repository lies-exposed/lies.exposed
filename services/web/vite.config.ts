import { defineEnv } from "@liexp/core/lib/frontend/defineEnv.js";
import { defineViteConfig } from "@liexp/core/lib/frontend/vite/config.js";
import { reactVirtualized } from "@liexp/ui/lib/vite/plugins/react-virtualized.js";
import { Schema } from "effect";

export const AppEnv = defineEnv((t) => ({
  VITE_NODE_ENV: Schema.String,
  VITE_PUBLIC_URL: Schema.String,
  VITE_API_URL: Schema.String,
  VITE_ADMIN_URL: Schema.String,
  VITE_DEBUG: Schema.String,
}));

export const port =
  process.env.VIRTUAL_PORT !== undefined
    ? parseInt(process.env.VIRTUAL_PORT, 10)
    : 4020;

// https://vitejs.dev/config/

export default defineViteConfig({
  cwd: import.meta.dirname,
  env: AppEnv,
  envFileDir: "./",
  output: "build",
  base: "/",
  server: {
    port,
    host: process.env.VIRTUAL_HOST ?? "0.0.0.0",
    allowedHosts:
      process.env.VITE_NODE_ENV === "development"
        ? ["liexp.dev"]
        : ["alpha.lies.exposed"],
    hmr: true,
  },
  target: "custom",
  entry: "src/client/index.tsx",
  html: {
    templatePath: "public/index.html",
  },
  tsConfigFile:
    process.env.VITE_NODE_ENV === "production"
      ? "tsconfig.build.json"
      : "tsconfig.json",

  plugins: [reactVirtualized()],
});
