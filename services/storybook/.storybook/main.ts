import { type StorybookConfig } from "@storybook/react-vite";
import type { ViteFinal } from "@storybook/builder-vite";
import path, { dirname, join } from "path";
import { mergeConfig } from "vite";
import { defineViteConfig } from "@liexp/core/lib/frontend/vite/config.js";
import * as t from "io-ts";

const viteFinal: ViteFinal = async (config, { configType }) => {
  const VITE_API_URL =
    configType === "PRODUCTION"
      ? "https://alpha.api.lies.exposed/v1"
      : "http://api.liexp.dev/v1";

  const VITE_PUBLIC_URL = configType === "PRODUCTION" ? "/storybook" : "/";

  process.env.VITE_API_URL = VITE_API_URL;
  process.env.VITE_PUBLIC_URL = VITE_PUBLIC_URL;

  const viteConfigUpdate = defineViteConfig({
    envFileDir: path.resolve(__dirname, ".."),
    cwd: process.cwd(),
    output: path.resolve(process.cwd(), "build"),
    assetDir: "assets",
    base: VITE_PUBLIC_URL,
    host: "localhost",
    port: config.server?.port ?? 6006,
    env: t.strict({ VITE_API_URL: t.string, VITE_PUBLIC_URL: t.string }),
    target: "spa",
    devServer: configType === "DEVELOPMENT" ? true : false,
    hot: true,
  });

  const updatedConfig = viteConfigUpdate({
    mode: configType?.toLowerCase() ?? "production",
    command: configType === "DEVELOPMENT" ? "serve" : "build",
  });

  delete updatedConfig.mode;
  delete updatedConfig.build?.commonjsOptions;
  delete updatedConfig.appType;
  delete updatedConfig.server;
  delete updatedConfig.ssr;
  delete updatedConfig.esbuild;
  delete updatedConfig.css;

  // remove react plugin
  // delete updatedConfig.plugins?.[4];
  // delete updatedConfig.plugins?.[5];
  // delete updatedConfig.plugins?.[6];
  delete updatedConfig.plugins;

  if (config.optimizeDeps?.entries !== undefined) {
    config.optimizeDeps.entries = (config.optimizeDeps?.entries ?? []).concat(
      ".storybook/preview.tsx",
    );
  }

  updatedConfig.base = "/storybook/";
  updatedConfig.resolve = {
    ...updatedConfig.resolve,
    preserveSymlinks: true,
  };

  console.log("config", config);
  console.log("updatedConfig", updatedConfig);

  const finalConfig = mergeConfig(config, updatedConfig);

  console.log("final config", finalConfig);
  return finalConfig;
};

const config: StorybookConfig = {
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],

  features: {
    // babelModeV7: true,
  },

  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  core: {
    builder: "@storybook/builder-vite",
    disableTelemetry: true,
  },
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {
      strictMode: true,
    },
  },
  docs: {
    autodocs: true,
  },

  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  viteFinal,
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
