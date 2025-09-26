import type { ViteFinal } from "@storybook/builder-vite";
import { defineMain } from "@storybook/react-vite/node";

const viteFinal: ViteFinal = async (config, { configType }) => {
  const { mergeConfig } = await import("vite");
  const { reactVirtualized } = await import(
    "@liexp/ui/lib/vite/plugins/react-virtualized.js"
  );

  if (configType === "DEVELOPMENT") {
    config.server!.allowedHosts = config.server?.allowedHosts ?? [];
    (config.server!.allowedHosts as string[]).push("storybook.liexp.dev");
  }

  const finalConfig = mergeConfig(config, {
    optimizeDeps: {
      entries: ["@liexp/core", "@liexp/shared", "@liexp/ui"],
    },
    plugins: [reactVirtualized()],
  });

  return finalConfig;
};

const config = defineMain({
  addons: ["@storybook/addon-links", "@storybook/addon-docs"],

  features: {
    legacyDecoratorFileOrder: true,
  },
  stories: [
    {
      directory: "../src",
      files: "**/*.@(mdx|stories.@(mdx|js|jsx|mjs|ts|tsx))",
    },
  ],
  framework: "@storybook/react-vite",
  core: {
    builder: "@storybook/builder-vite",
    disableTelemetry: true,
  },
  typescript: {
    check: true,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !prop.parent.fileName.includes("node_modules") : true,
    },
  },
  viteFinal,
});

export default config;
