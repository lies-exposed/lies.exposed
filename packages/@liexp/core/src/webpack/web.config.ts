import * as path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlReplaceWebpackPlugin from "html-replace-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as t from "io-ts";
import * as webpack from "webpack";
import { getConfig, GetConfigParams } from "./config";

export const getWebConfig = <A extends Record<string, t.Mixed>>(
  opts: GetConfigParams<A>
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
    })
  );
  config.plugins?.push(
    new HtmlWebpackPlugin({
      template: path.resolve(opts.cwd, "public/index.html"),
      inject: true,
      showErrors: true,
    })
  );

  config.plugins?.push(
    new HtmlReplaceWebpackPlugin([
      {
        pattern: "%PUBLIC_URL%",
        replacement: process.env.PUBLIC_URL ?? "/",
      },
    ]) as any
  );

  return config;
};
