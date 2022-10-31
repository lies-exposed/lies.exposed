/* eslint-disable @typescript-eslint/no-var-requires */
import * as path from "path";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import DotenvWebpackPlugin from "dotenv-webpack";
import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { PathReporter } from "io-ts/lib/PathReporter";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ReactRefreshTypescript from "react-refresh-typescript";
import TerserPlugin from "terser-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import * as webpack from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { GetLogger } from "../logger";
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const webpackLogger = GetLogger("webpack");

const DEVELOPMENT = t.literal("development");
const PRODUCTION = t.literal("production");
const NODE_ENV = t.union(
  [DEVELOPMENT, t.literal("test"), PRODUCTION],
  "NODE_ENV"
);

export interface GetConfigParams<A extends Record<string, t.Mixed>> {
  cwd: string;
  env: t.ExactC<t.TypeC<A>>;
  envFileDir: string;
  port?: number;
  entry?: { [key: string]: string };
  devServer?: boolean;
  target: webpack.Configuration["target"];
  output?: webpack.Configuration["output"];
  hot: boolean;
}

const getConfig = <A extends Record<string, t.Mixed>>(
  opts: GetConfigParams<A>
): webpack.Configuration => {
  webpackLogger.debug.log("Getting config for options %O", opts);
  // webpackLogger.debug.log("Initial process.env %O", process.env);
  const mode: webpack.Configuration["mode"] =
    (process.env.NODE_ENV as webpack.Configuration["mode"]) ??
    ("development" as const);
  const DOTENV_CONFIG_PATH = path.resolve(
    opts.envFileDir,
    process.env.DOTENV_CONFIG_PATH ?? ".env"
  );

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

  const plugins = [
    new webpack.ProgressPlugin({
      entries: true,
      percentBy: "entries",
    }),
  ];

  if (opts.target === "web" ?? opts.target === "electron-renderer") {
    const stringifiedAppEnv = pipe(
      appEnv,
      R.reduceWithIndex(S.Ord)(
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

    webpackLogger.debug.log(
      "Process env for define plugin %O",
      stringifiedAppEnv
    );

    plugins.push(new webpack.DefinePlugin(stringifiedAppEnv));
    plugins.push(
      new DotenvWebpackPlugin({
        path: DOTENV_CONFIG_PATH,
        silent: true,
      })
    );
  }

  if (opts.hot && opts.target === "web" && mode === "development") {
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  if (buildENV.BUNDLE_STATS) {
    plugins.push(
      new BundleAnalyzerPlugin({
        generateStatsFile: true,
        analyzerMode: "json",
      })
    );
  }

  const devServerConf = opts.devServer
    ? {
        devServer: {
          static: {
            directory: opts.output?.path ?? path.join(opts.cwd, "build"),
          },
          host: "0.0.0.0",
          compress: true,
          port: opts.port,
        },
      }
    : {};

  const config: webpack.Configuration = {
    mode,
    ...devServerConf,
    target: opts.target,
    context: opts.cwd,
    entry: opts.entry ?? {
      app: path.resolve(opts.cwd, "src/index.tsx"),
    },

    output: {
      path: opts.output?.path ?? path.resolve(opts.cwd, "build"),
      publicPath: opts.output?.publicPath ?? "/",
      chunkFilename: (pathData) => {
        return pathData.chunk?.name === "app"
          ? "[name].js"
          : "[name].[hash].js";
      },
      filename: (pathData) => {
        return pathData.chunk?.name === "app"
          ? "[name].js"
          : "[name].[hash].js";
      },
      clean: true,
    },
    // optimization,
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                context: opts.cwd,
                projectReferences: mode === "development",
                transpileOnly: true,
                getCustomTransformers: () => ({
                  before: [
                    mode === "development" &&
                      opts.hot &&
                      ReactRefreshTypescript(),
                  ].filter(Boolean),
                }),
              },
            },
          ],
        },
        {
          test: /\.(png|gif|svg)$/,
          use: "file-loader",
        },
        {
          test: /\.css$/,
          use: [
            mode === "development"
              ? "style-loader"
              : MiniCssExtractPlugin.loader,
            "css-loader",
          ],
        },
      ],
    },

    devtool: mode === "production" ? undefined : "source-map",

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      plugins: [new TsconfigPathsPlugin({}) as any],
      modules: [
        "node_modules",
        path.resolve(opts.cwd),
      ],
    },
    plugins: plugins as any,
  };

  if (config.mode === "production") {
    config.plugins = [
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
    ].concat(config.plugins as any[]);

    config.optimization = {
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin({
          parallel: false,
          extractComments: "all",
        }),
      ],
    };
  }

  // const configWithTimeMeasures = new SpeedMeasurePlugin({}).wrap(config);

  return config;
};

const defineEnv = <P extends t.Props>(
  fn: (io: typeof t) => P
): t.ExactC<t.TypeC<P>> => {
  return t.strict<P>(fn(t), "AppEnv");
};

export { getConfig, defineEnv };
