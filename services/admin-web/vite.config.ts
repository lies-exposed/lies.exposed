import { defineEnv } from "@liexp/core/lib/frontend/defineEnv.js";
import { defineViteConfig } from "@liexp/core/lib/frontend/vite/config.js";
import { defineConfig } from "vite";

export const AppEnv = defineEnv((t) => ({
  VITE_NODE_ENV: t.string,
  VITE_PUBLIC_URL: t.string,
  VITE_API_URL: t.string,
  VITE_WEB_URL: t.string,
  VITE_DEBUG: t.string,
}));

export const port =
  process.env.VIRTUAL_PORT !== undefined
    ? parseInt(process.env.VIRTUAL_PORT, 10)
    : 80;

const config = defineViteConfig({
  cwd: import.meta.dirname,
  base: "/admin/",
  env: AppEnv,
  envFileDir: "./",
  port,
  host: process.env.VIRTUAL_HOST ?? "0.0.0.0",
  devServer: true,
  hot: true,
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
});

export default defineConfig(config);
