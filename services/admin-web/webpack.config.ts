import { defineEnv } from "../../packages/@liexp/core/src/webpack/config";
import { getWebConfig } from "../../packages/@liexp/core/src/webpack/web.config";

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

(config.optimization as any).minimizer = [
  (config.optimization as any).minimizer[0],
];

module.exports = { ...config, devtool: undefined };
