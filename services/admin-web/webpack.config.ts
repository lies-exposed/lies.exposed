import { defineEnv } from "@liexp/core/lib/webpack/config.js";
import { getWebConfig } from "@liexp/core/lib/webpack/web.config.js";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4001;
const config = getWebConfig({
  cwd: __dirname,
  env: defineEnv((t) => ({
    NODE_ENV: t.string,
    PUBLIC_URL: t.string,
    API_URL: t.string,
    DEBUG: t.string,
    WEB_URL: t.string,
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
