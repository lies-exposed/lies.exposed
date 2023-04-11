import { type StorybookConfig } from "@storybook/react-webpack5";
import path from "path";
import TSConfigPathsWebpackPlugin from "tsconfig-paths-webpack-plugin";

const webpackConfig: Pick<StorybookConfig, "webpackFinal"> = {
  webpackFinal: (config) => {
    // add rules for css
    config.module?.rules?.push({
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"],
      include: path.resolve(__dirname, "../"),
    });

    const coreBaseUrl = path.resolve(
      process.cwd(),
      "../../packages/@liexp/core/tsconfig.json"
    );

    // config.resolve?.modules?.push(
    //   path.resolve(process.cwd(), "../../packages/@liexp/ui")
    // );

    // console.log(config.resolve);
    if (!config.resolve) {
      config.resolve = {};
    }

    config.resolve.modules?.unshift("../../node_modules");

    // console.log("resolve", config.resolve);

    config.resolve.alias = {
      ...config.resolve.alias,
      "react/jsx-runtime.js": "react/jsx-runtime",
      "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",

      // "react/jsx-runtime": path.resolve(
      //   process.cwd(),
      //   "../../node_modules/react/jsx-runtime.js"
      // ),
    };

    if (!config.resolve.plugins) {
      config.resolve.plugins = [];
    }
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

    // console.log("config modules", config.module);
    // console.log("module rules", config.module?.rules);
    // console.log("config resolve", config.resolve);
    // console.log("config", config);

    config.resolve.fallback = {
      ...config.resolve.fallback,
      assert: require.resolve("browser-assert"),
    };
    // console.log(config);
    return config;
  },
};

const config: StorybookConfig & {
  env: any;
} = {
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  features: {
    // babelModeV7: true,
  },
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  core: {
    disableTelemetry: true,
  },
  framework: {
    name: "@storybook/react-webpack5",
    options: {
      legacyRootApi: true,
    },
  },
  docs: {
    autodocs: true,
  },
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
  ...webpackConfig,
};

export default config;
