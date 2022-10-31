import HtmlReplaceWebpackPlugin from "html-replace-webpack-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";
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
  tsConfigFile:
    process.env.NODE_ENV === "production"
      ? "tsconfig.build.json"
      : "tsconfig.json",
});

webConfig.optimization =
  webConfig.mode === "production"
    ? {
        chunkIds: "named",
        moduleIds: "named",
        mergeDuplicateChunks: true,
        flagIncludedChunks: true,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            parallel: false,
            extractComments: "all",
          }),
        ],
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            liexpCore: {
              name: "liexp-core",
              test: /[\\/]@liexp\/core[\\/]/,
            },
            liexpShared: {
              name: "liexp-shared",
              test: /[\\/]@liexp\/shared[\\/]/,
            },
            liexpUi: {
              name: "liexp-ui",
              test: /[\\/]@liexp\/ui[\\/]/,
            },
            vendorFortAwesome: {
              test: /[\\/]@fortawesome[\\/]/,
              name: "fortawesome",
              enforce: true,
            },
            vendorMUI: {
              test: /[\\/]@mui[\\/]/,
              name: "mui",
              enforce: true,
            },
            vendorFPTS: {
              test: /[\\/]fp-ts[\\/]/,
              name: "fp-ts",
              enforce: true,
            },
            vendorReact: {
              test: /.*\/node_modules\/react\/index\.js/,
              name: "react",
              chunks: "initial",
              enforce: true,
            },
            vendorReactPageEditor: {
              test: /[\\/]@react-page\/editor[\\/]/,
              name: "react-page-editor",
              enforce: true,
            },
            vendorReactPage: {
              test: /[\\/]@react-page[\\/]/,
              name: "react-page",
              enforce: true,
            },
            vendorReactDOM: {
              test: /[\\/]react-dom[\\/]/,
              name: "react-dom",
              enforce: true,
            },
            vendorReactQuery: {
              test: /[\\/]react-query[\\/]/,
              name: "react-query",
              enforce: true,
            },
          },
        },
      }
    : {};

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
