import { loadENV } from "@liexp/core/lib/env/utils.js";
import { defineEnv } from "@liexp/core/lib/frontend/defineEnv.js";
import { defineViteConfig } from "@liexp/core/lib/frontend/vite/config.js";
import { defineConfig } from "vite";

export const AppEnv = defineEnv((t) => ({
  VITE_NODE_ENV: t.string,
  VITE_PUBLIC_URL: t.string,
  VITE_API_URL: t.string,
  VITE_ADMIN_URL: t.string,
  VITE_DEBUG: t.string,
}));

loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? ".env");

export const port =
  process.env.VIRTUAL_PORT !== undefined
    ? parseInt(process.env.VIRTUAL_PORT, 10)
    : 4020;

// https://vitejs.dev/config/
const config = defineViteConfig({
  cwd: import.meta.dirname,
  env: AppEnv,
  envFileDir: "./",
  output: "build",
  base: "/",
  port,
  host: process.env.VIRTUAL_HOST ?? "0.0.0.0",
  devServer: true,
  hot: true,
  target: "custom",
  entry: "src/client/index.tsx",
  html: {
    templatePath: "public/index.html",
  },
  tsConfigFile:
    process.env.VITE_NODE_ENV === "production"
      ? "tsconfig.build.json"
      : "tsconfig.json",
});

export default defineConfig(config);
