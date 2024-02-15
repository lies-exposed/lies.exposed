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
      : "http://localhost:4010/v1";

  process.env.VITE_API_URL = VITE_API_URL;

  const viteConfigUpdate = defineViteConfig({
    envFileDir: path.resolve(__dirname, ".."),
    cwd: process.cwd(),
    output: "build",
    assetDir: "assets",
    env: t.strict({ VITE_API_URL: t.string }),
    target: "web",
    hot: false,
  });

  const updatedConfig = viteConfigUpdate({
    mode: configType?.toLowerCase() ?? "production",
    command: configType === "DEVELOPMENT" ? "serve" : "build",
  });

  delete updatedConfig.server;
  delete updatedConfig.ssr;
  delete updatedConfig.build?.outDir;

  // remove react plugin
  delete updatedConfig.plugins?.[4];
  delete updatedConfig.plugins?.[5];
  delete updatedConfig.plugins?.[6];

  if (config.optimizeDeps?.entries !== undefined) {
    config.optimizeDeps.entries = (config.optimizeDeps?.entries ?? []).concat(
      ".storybook/preview.tsx",
    );
  }

  const finalConfig = mergeConfig(config, updatedConfig);

  return finalConfig;
};

const config: StorybookConfig = {
  // previewHead: (head, { configType }) => {
  //   if (configType === "PRODUCTION") {
  //     return `<base href="/storybook/" /> ${head.replace} `;
  //   }
  //   return head;
  // },
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
