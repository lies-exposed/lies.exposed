const path = require("path");
const TSConfigPathsWebpackPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal: (config) => {
    // config.module.rules[0].use[0].options.plugins.push(
    //   require.resolve("babel-plugin-remove-graphql-queries")
    // )
    config.node = {
      ...config.node,
      fs: "empty",
      tls: "empty",
      net: "empty",
      module: "empty",
      console: true,
    };
    config.module.rules.push({
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"],
      include: path.resolve(__dirname, "../"),
    });

    const coreBaseUrl = path.resolve(
      process.cwd(),
      "../../packages/@econnessione/core/tsconfig.json"
    );

    config.resolve.plugins.push(
      new TSConfigPathsWebpackPlugin({
        configFile: coreBaseUrl,
      })
    );

    const sharedBaseUrl = path.resolve(
      process.cwd(),
      "../../packages/@econnessione/shared/tsconfig.json"
    );
    // console.log(sharedBaseUrl);
    config.resolve.plugins.push(
      new TSConfigPathsWebpackPlugin({
        configFile: sharedBaseUrl,
      })
    );
    config.resolve.plugins.push(new TSConfigPathsWebpackPlugin());

    // console.log("config", config.module.rules);
    // console.log("config", config.resolve.plugins);
    // console.log("config", config);

    return config;
  },
};
