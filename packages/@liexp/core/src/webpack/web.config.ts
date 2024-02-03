import * as path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlReplaceWebpackPlugin from "html-replace-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import type * as t from "io-ts";
import TerserPlugin from "terser-webpack-plugin";
import type * as webpack from "webpack";
import { getConfig, type GetConfigParams } from "./config";

export const webOptimization: webpack.Configuration["optimization"] = {
  chunkIds: "named",
  moduleIds: "named",
  mergeDuplicateChunks: true,
  flagIncludedChunks: true,
  minimize: true,
  minimizer: [
    new TerserPlugin({
      parallel: 6,
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
      liexpUiContainers: {
        name: "liexp-ui-components",
        test: /[\\/]@liexp\/ui\/containers[\\/]/,
      },
      liexpUiComponents: {
        name: "liexp-ui-components",
        test: /[\\/]@liexp\/ui\/components[\\/]/,
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
        test: /[\\/]@tanstack\/react-query[\\/]/,
        name: "@tanstack-react-query",
        enforce: true,
      },
    },
  },
};

export const getWebConfig = <A extends Record<string, t.Mixed>>(
  opts: GetConfigParams<A>,
): webpack.Configuration => {
  const config = getConfig(opts);

  config.plugins?.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(opts.cwd, "public"),
          filter: (file: string) => {
            return file !== path.resolve(opts.cwd, "public", "index.html");
          },
        },
      ],
    }),
  );
  config.plugins?.push(
    new HtmlWebpackPlugin({
      template: path.resolve(opts.cwd, "public/index.html"),
      inject: true,
      showErrors: true,
    }),
  );

  config.plugins?.push(
    new HtmlReplaceWebpackPlugin([
      {
        pattern: "%PUBLIC_URL%",
        replacement: process.env.PUBLIC_URL ?? "/",
      },
    ]) as any,
  );

  config.resolve = {
    ...config.resolve,
    alias: {
      "react/jsx-runtime.js": "react/jsx-runtime",
      "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
    },
  };

  config.optimization = config.mode === "production" ? webOptimization : {};

  return config;
};

export { HtmlWebpackPlugin, TerserPlugin, HtmlReplaceWebpackPlugin };
