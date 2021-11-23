/* eslint-disable no-console */

import path from "path";
import DotenvPlugin from "dotenv-webpack";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { PathReporter } from "io-ts/lib/PathReporter";
import { DefinePlugin, Configuration } from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { makeAliases } from "./paths";

const DEVELOPMENT = t.literal("development");
const PRODUCTION = t.literal("production");
const NODE_ENV = t.union(
  [DEVELOPMENT, t.literal("test"), PRODUCTION],
  "NODE_ENV"
);

const getConfig = (dir: string, tsConfig: any): Configuration => {
  const mode: Configuration["mode"] =
    process.env.NODE_ENV ?? ("production" as any);

  const dotEnvConfigPath = path.resolve(
    process.cwd(),
    mode === "production" ? ".env" : ".env.development"
  );

  const BUILD_ENV = t.strict(
    {
      NODE_ENV,
      BUNDLE_TARGET: t.union([t.literal("firefox"), t.literal("chrome")]),
      BUNDLE_STATS: BooleanFromString,
    },
    "processENV"
  );

  const buildENV = pipe(
    {
      BUNDLE_TARGET: "chrome",
      BUNDLE_STATS: "false",
      NODE_ENV: mode,
      ...process.env,
    },
    BUILD_ENV.decode,
    (validation: any) => {
      if (validation._tag === "Left") {
        console.error(PathReporter.report(validation).join("\n"));
        console.log("\n");
        throw new Error("process.env decoding failed.");
      }
      return validation.right;
    }
  );

  const plugins = [
    new DefinePlugin({
      "process.env.REACT_APP_BUILD_DATE": JSON.stringify(
        new Date().toISOString()
      ),
      "process.env.NODE_ENV": JSON.stringify(mode),
    }) as any,

    new DotenvPlugin({
      path: dotEnvConfigPath,
    }),
  ];

  if (buildENV.BUNDLE_STATS) {
    plugins.push(
      new BundleAnalyzerPlugin({
        generateStatsFile: true,
        analyzerMode: "json",
      })
    );
  }

  return {
    mode,

    entry: {
      app: "./src/index.tsx",
    },

    output: {
      path: path.resolve(dir, "build"),
      filename: "[name].js",
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  noEmit: false,
                  sourceMap: true,
                },
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.(ttf|svg|eot|woff|woff2|otf|png|gif)$/,
          type: "asset" as any,
        },
        {
          test: /\.(scss|css)$/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
            },
          ],
        },
      ],
    },

    devtool: mode === "development" ? "inline-source-map" : false,

    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      alias: makeAliases(
        path.resolve(dir, tsConfig.compilerOptions.baseUrl),
        tsConfig.compilerOptions.paths ?? {}
      ),
    },

    plugins,
  };
};

export { getConfig };
