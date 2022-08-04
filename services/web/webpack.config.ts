import HTMLWebpackPlugin from "html-webpack-plugin";
import HtmlReplaceWebpackPlugin from "html-replace-webpack-plugin";
import path from "path";
import { defineEnv } from "../../packages/@liexp/core/src/webpack/config";
import { getWebConfig } from "../../packages/@liexp/core/src/webpack/web.config";

const AppEnv = defineEnv((t) => ({
  NODE_ENV: t.string,
  PUBLIC_URL: t.string,
  API_URL: t.string,
  ADMIN_URL: t.string,
  DEBUG: t.string,
}));

const port =
  process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 4000;

const webConfig = getWebConfig({
  cwd: __dirname,
  env: AppEnv,
  envFileDir: __dirname,
  port,
  devServer: false,
  hot: false,
  target: "web",
  entry: {
    app: path.resolve(__dirname, "src/client/index.tsx"),
  },
});

webConfig.plugins?.push(
  new HtmlReplaceWebpackPlugin([
    {
      pattern: "%WEB_ANALYTICS_SCRIPT%",
      replacement:
        process.env.NODE_ENV === "production"
          ? `<script data-goatcounter="https://liexp.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`
          : "",
    },
  ]) as any
);

export default webConfig;
