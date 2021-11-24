/* eslint-disable @typescript-eslint/no-var-requires */
import * as path from "path";
import { pipe } from "fp-ts/lib/function";
import HtmlReplaceWebpackPlugin from "html-replace-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { PathReporter } from "io-ts/lib/PathReporter";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import { Configuration, DefinePlugin } from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { GetLogger } from "../logger";
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DotenvPlugin = require("dotenv-webpack");

const webpackLogger = GetLogger("webpack");

const DEVELOPMENT = t.literal("development");
const PRODUCTION = t.literal("production");
const NODE_ENV = t.union(
  [DEVELOPMENT, t.literal("test"), PRODUCTION],
  "NODE_ENV"
);

const getConfig = (cwd: string, port: number): Configuration => {
  const mode: Configuration["mode"] =
    (process.env.NODE_ENV as Configuration["mode"]) ?? ("production" as const);

  const dotEnvConfigPath =
    process.env.DOTENV_CONFIG_PATH ??
    path.resolve(
      process.cwd(),
      "../../",
      mode === "production" ? ".env" : ".env.dev"
    );

  webpackLogger.debug.log(`DOTENV_CONFIG_PATH %s`, dotEnvConfigPath);
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
        webpackLogger.error.log(
          `Validation error for build end: %O`,
          PathReporter.report(validation).join("\n")
        );
        throw new Error("process.env decoding failed.");
      }
      return validation.right;
    }
  );

  const plugins = [
    new DefinePlugin({
      "process.env.BUILD_DATE": JSON.stringify(new Date().toISOString()),
      "process.env.NODE_ENV": JSON.stringify(mode),
    }) as any,

    new DotenvPlugin({
      path: dotEnvConfigPath,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(cwd, "public"),
          filter: (file: string) => {
            return file !== path.resolve(cwd, "public", "index.html");
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(cwd, "public/index.html"),
      inject: true,
      showErrors: true,
    }),
    new HtmlReplaceWebpackPlugin([
      {
        pattern: "%PUBLIC_URL%",
        replacement: process.env.PUBLIC_URL ?? "/",
      },
    ]),
  ];

  if (buildENV.BUNDLE_STATS) {
    plugins.push(
      new BundleAnalyzerPlugin({
        generateStatsFile: true,
        analyzerMode: "json",
      })
    );
  }

  const devServerConf = {
    devServer: {
      static: {
        directory: path.join(cwd, "build"),
      },
      compress: true,
      port: port,
    },
  };

  return {
    mode,
    ...devServerConf,
    entry: {
      app: path.resolve(cwd, "src/index.tsx"),
    },

    output: {
      path: path.resolve(cwd, "build"),
      filename: "[name].js",
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          // include: tsLoaderIncludes,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: path.resolve(cwd, "tsconfig.json"),
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.(ttf|svg|eot|woff|woff2|otf|png|gif)$/,
          use: [{ loader: "file-loader" }],
        },
        {
          test: /\.(css)$/,
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
      // alias,
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(cwd, "./tsconfig.json"),
        }),
      ],
    },

    plugins,
  };
};

export { getConfig };
