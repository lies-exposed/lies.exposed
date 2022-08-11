const path = require("path");
const TSConfigPathsWebpackPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  core: {
    builder: "webpack5",
  },
  addons: [
    "@storybook/addon-actions",
    "@storybook/addon-docs",
    "@storybook/addon-controls",
  ],
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  env: (config) => ({
    ...config,
    API_URL: "http://localhost:4010/v1",
  }),
  webpackFinal: (config) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"],
      include: path.resolve(__dirname, "../"),
    });

    const coreBaseUrl = path.resolve(
      process.cwd(),
      "../../packages/@liexp/core/tsconfig.json"
    );

    config.resolve.plugins = [];

    config.resolve.plugins.push(
      new TSConfigPathsWebpackPlugin({
        configFile: coreBaseUrl,
      })
    );

    const sharedBaseUrl = path.resolve(
      process.cwd(),
      "../../packages/@liexp/shared/tsconfig.json"
    );

    // console.log(sharedBaseUrl);
    config.resolve.plugins.push(
      new TSConfigPathsWebpackPlugin({
        configFile: sharedBaseUrl,
      })
    );

    const uiConfigFile = path.resolve(
      process.cwd(),
      "../../packages/@liexp/ui/tsconfig.json"
    );

    config.resolve.plugins.push(
      new TSConfigPathsWebpackPlugin({
        configFile: uiConfigFile,
      })
    );
    config.resolve.plugins.push(new TSConfigPathsWebpackPlugin());

    // console.log("config", config.module.rules);
    // console.log("config", config.resolve.plugins);
    // console.log("config", config);

    return config;
  },
};
