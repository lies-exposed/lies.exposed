import HTMLWebpackPlugin from "html-webpack-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import {
  defineEnv
} from "../../packages/@liexp/core/src/webpack/config";
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

webConfig.optimization =
  webConfig.mode === "production"
    ? {
        // chunkIds: "deterministic",
        minimize: true,
        minimizer: [
          // new TerserPlugin({
          //   parallel: false,
          //   extractComments: 'all'
          // }),
        ],
        // splitChunks: {
        //   cacheGroups: {
        //     liexp: {
        //       name: "@liexp",
        //       test: /[\\/]@liexp[\\/]/,
        //       chunks: "all",
        //     },
        //   },
        // },
      }
    : {};

webConfig.plugins?.push(
  new HTMLWebpackPlugin({
    inject: "head",
    template: path.resolve("./public/index.html"),
  })
);

export default webConfig;
