import { defineEnv } from "@liexp/core/lib/webpack/config.js";
import { getWebConfig } from "@liexp/core/lib/webpack/web.config.js";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4001;
const config = getWebConfig({
  cwd: __dirname,
  env: defineEnv((t) => ({
    NODE_ENV: t.string,
    VITE_PUBLIC_URL: t.string,
    VITE_API_URL: t.string,
    VITE_DEBUG: t.string,
    VITE_WEB_URL: t.string,
  })),
  envFileDir: __dirname,
  port,
  output: {
    publicPath: "/admin/",
  },
  devServer: true,
  hot: false,
  target: "web",
});

export default { ...config, devtool: undefined };
