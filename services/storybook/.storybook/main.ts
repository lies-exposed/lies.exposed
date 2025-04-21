import { type StorybookConfig } from "@storybook/react-vite";
import type { ViteFinal } from "@storybook/builder-vite";
import path from "path";
import {Schema} from 'effect'

const viteFinal: ViteFinal = async (config, { configType }) => {
  const { mergeConfig } = await import("vite");
  const { defineViteConfig } = await import(
    "@liexp/core/lib/frontend/vite/config.js"
  );
  const { reactVirtualized } = await import(
    "@liexp/ui/lib/vite/plugins/react-virtualized.js"
  );

  const cwd = path.resolve(__dirname, "..");

  const viteConfigUpdate = defineViteConfig({
    envFileDir: cwd,
    cwd,
    output: path.resolve(cwd, "build"),
    assetDir: "assets",
    base: "/",
    host: "localhost",
    port: config.server?.port ?? 6006,
    env: Schema.Struct({ VITE_API_URL: Schema.String, VITE_PUBLIC_URL: Schema.String }),
    target: "spa",
    devServer: configType === "DEVELOPMENT" ? true : false,
    hot: true,
    plugins: [reactVirtualized()],
  });

  const updatedConfig = viteConfigUpdate({
    mode: configType?.toLowerCase() ?? "production",
    command: configType === "DEVELOPMENT" ? "serve" : "build",
  });

  // const { dirname } = require('path');
  // https://github.com/eirslett/storybook-builder-vite/issues/55
  // updatedConfig.root = dirname(require.resolve('@storybook/builder-vite'));

  delete updatedConfig.mode;
  delete updatedConfig.build?.commonjsOptions;
  delete updatedConfig.appType;
  delete updatedConfig.server;
  delete updatedConfig.ssr;
  delete updatedConfig.esbuild;
  delete updatedConfig.css;
  delete updatedConfig.optimizeDeps!.include;
  // delete updatedConfig.optimizeDeps?.include

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

  updatedConfig.optimizeDeps!.entries = (config.optimizeDeps?.entries ?? []).concat(
    ...["@liexp/core", "@liexp/shared", "@liexp/ui"].map((p) => `${p}/lib/**`),
  );
  delete config.optimizeDeps?.entries

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
    builder: getAbsolutePath("@storybook/builder-vite"),
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
  // const absolutePath = dirname(require.resolve(join(value, "package.json")));
  // console.log("absolutePath", absolutePath);
  // return absolutePath;
  return value;
}
