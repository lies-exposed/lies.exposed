import { defineEnv } from "@liexp/core/lib/frontend/defineEnv.js";
import { defineViteConfig } from "@liexp/core/lib/frontend/vite/config.js";
import { reactVirtualized } from "@liexp/ui/lib/vite/plugins/react-virtualized.js";

export const AppEnv = defineEnv((Schema) => ({
  VITE_NODE_ENV: Schema.String,
  VITE_PUBLIC_URL: Schema.String,
  VITE_OPENAI_URL: Schema.String,
  VITE_API_URL: Schema.String,
  VITE_WEB_URL: Schema.String,
  VITE_DEBUG: Schema.String,
}));

export const port =
  process.env.VIRTUAL_PORT !== undefined
    ? parseInt(process.env.VIRTUAL_PORT, 10)
    : 80;

const config = defineViteConfig({
  cwd: import.meta.dirname,
  base: "/",
  env: AppEnv,
  envFileDir: __dirname,
  server: {
    port,
    host: process.env.VIRTUAL_HOST ?? "0.0.0.0",
    hmr: true,
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
});

export default config;
