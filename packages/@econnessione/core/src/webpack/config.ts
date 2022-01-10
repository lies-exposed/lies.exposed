/* eslint-disable @typescript-eslint/no-var-requires */
import * as path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import DotenvPlugin from "dotenv-webpack";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/function";
import HtmlReplaceWebpackPlugin from "html-replace-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { PathReporter } from "io-ts/lib/PathReporter";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import { Configuration, DefinePlugin } from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { GetLogger } from "../logger";

const webpackLogger = GetLogger("webpack");

const DEVELOPMENT = t.literal("development");
const PRODUCTION = t.literal("production");
const NODE_ENV = t.union(
  [DEVELOPMENT, t.literal("test"), PRODUCTION],
  "NODE_ENV"
);

interface GetConfigParams<A extends Record<string, t.Mixed>> {
  cwd: string;
  env: t.Type<A, unknown, unknown>;
  envFileDir: string;
  port: number;
}

const getConfig = <A extends Record<string, t.Mixed>>(
  opts: GetConfigParams<A>
): Configuration => {
  // webpackLogger.debug.log("Initial process.env %O", process.env);
  const mode: Configuration["mode"] =
    (process.env.NODE_ENV as Configuration["mode"]) ?? ("development" as const);
  const DOTENV_CONFIG_PATH =
    process.env.DOTENV_CONFIG_PATH ?? path.resolve(opts.envFileDir, ".env");

  webpackLogger.debug.log(`DOTENV_CONFIG_PATH %s`, DOTENV_CONFIG_PATH);

  require("dotenv").config({ path: DOTENV_CONFIG_PATH });

  // webpackLogger.debug.log('process.env after dotenv %O', process.env)

  webpackLogger.debug.log("mode %s", mode);

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

  const appEnv = pipe(process.env, opts.env.decode, (validation) => {
    if (validation._tag === "Left") {
      webpackLogger.error.log(
        `Validation error for build end: %O`,
        PathReporter.report(validation).join("\n")
      );
      throw new Error(`${opts.env.name} decoding failed.`);
    }
    return validation.right;
  });

  const stringifiedAppEnv = pipe(
    appEnv,
    R.reduceWithIndex(
      {
        "process.env.BUILD_DATE": JSON.stringify(new Date().toISOString()),
        "process.env.NODE_ENV": JSON.stringify(mode),
      },
      (key, acc, v) => ({
        ...acc,
        [`process.env.${key}`]: JSON.stringify(v),
      })
    )
  );

  const plugins = [
    new DefinePlugin(stringifiedAppEnv) as any,

    new DotenvPlugin({
      path: DOTENV_CONFIG_PATH,
    }),
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
    new HtmlWebpackPlugin({
      template: path.resolve(opts.cwd, "public/index.html"),
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

  if (mode === "production") {
    plugins.push(new MiniCssExtractPlugin());
  }

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
        directory: path.join(opts.cwd, "build"),
      },
      host: "0.0.0.0",
      compress: true,
      port: opts.port,
    },
  };

  return {
    mode,
    ...devServerConf,
    entry: {
      app: path.resolve(opts.cwd, "src/index.tsx"),
    },

    context: opts.cwd,

    output: {
      path: path.resolve(opts.cwd, "build"),
      filename: "[name].js",
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                context: opts.cwd,
                transpileOnly: false,
                projectReferences: true,
              },
            },
          ],
        },
        {
          test: /\.(ttf|svg|eot|woff|woff2|otf|png|gif)$/,
          type: "asset/inline",
        },
        {
          test: /\.css$/,
          use:
            mode === "development"
              ? ["style-loader", "css-loader"]
              : [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },

    devtool: mode === "development" ? "source-map" : false,

    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      plugins: [
        new TsconfigPathsPlugin({
          context: opts.cwd,
        }),
      ],
      modules: [
        path.resolve(opts.cwd, 'node_modules'),
        path.resolve(opts.cwd, '../../'),
        path.resolve(opts.cwd, "../../node_modules"),
      ],
    },
    plugins,
  };
};

const defineEnv = (fn: (io: typeof t) => t.Props): t.Type<t.Props> => {
  return t.strict(fn(t), "AppEnv");
};

export { getConfig, defineEnv };
