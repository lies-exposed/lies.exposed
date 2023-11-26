import { type StorybookConfig } from "@storybook/react-webpack5";
import path from "path";
import TSConfigPathsWebpackPlugin from "tsconfig-paths-webpack-plugin";

const webpackConfig: Pick<StorybookConfig, "webpackFinal" | "webpack"> = {
  webpack: (config, { configType }) => {
    if (!config.output) {
      config.output = {};
    }
    if (configType === "PRODUCTION") {
      // config.output.publicPath = "storybook";
    }
    return config;
  },
  webpackFinal: (config, { configType }) => {
    // if (!config.output) {
    //   config.output = {};
    // }

    // if (configType === "PRODUCTION") {
    //   config.output.publicPath = "storybook";
    // }

    // add rules for css
    config.module?.rules?.push({
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"],
      include: path.resolve(__dirname, "../"),
    });

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
    const coreBaseUrl = path.resolve(
      process.cwd(),
      "../../packages/@liexp/core/tsconfig.json",
    );

    config.resolve.plugins.push(
      new TSConfigPathsWebpackPlugin({
        configFile: coreBaseUrl,
      }),
    );
    const sharedBaseUrl = path.resolve(
      process.cwd(),
      "../../packages/@liexp/shared/tsconfig.json",
    );

    // console.log(sharedBaseUrl);
    config.resolve.plugins.push(
      new TSConfigPathsWebpackPlugin({
        configFile: sharedBaseUrl,
      }),
    );
    const uiConfigFile = path.resolve(
      process.cwd(),
      "../../packages/@liexp/ui/tsconfig.json",
    );
    config.resolve.plugins.push(
      new TSConfigPathsWebpackPlugin({
        configFile: uiConfigFile,
      }),
    );
    config.resolve.plugins.push(new TSConfigPathsWebpackPlugin());

    config.resolve.fallback = {
      ...config.resolve.fallback,
      assert: require.resolve("browser-assert"),
    };
    return config;
  },
};

const config: StorybookConfig & {
  env: any;
} = {
  // previewHead: (head, { configType }) => {
  //   if (configType === "PRODUCTION") {
  //     return `<base href="/storybook/" /> ${head.replace} `;
  //   }
  //   return head;
  // },
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
  env: (config, { configType }) => {
    const API_URL =
      configType === "PRODUCTION"
        ? "https://alpha.api.lies.exposed/v1"
        : "http://localhost:4010/v1";
    return {
      ...config,
      API_URL,
    };
  },
  ...webpackConfig,
};

export default config;
