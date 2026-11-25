import { URL } from "url";
import {
  defineConfig,
  type ViteUserConfig,
  mergeConfig,
  coverageConfigDefaults,
} from "vitest/config";

type ToAlias = (mockPath: string) => string;

export const PathnameAlias =
  (url: string): ToAlias =>
  (mockPath) => {
    // console.log("mockPath", mockPath, url);
    const pathname = new URL(mockPath, url).pathname;
    // console.log("pathname", pathname);
    return pathname;
  };

export const extendBaseConfig = (
  root: string,
  configFn: (toAlias: ToAlias) => ViteUserConfig,
) => {
  const toAlias = PathnameAlias(root);
  const config = configFn(toAlias);

  const finalConfig = mergeConfig(
    defineConfig({
      root: toAlias("./"),
      test: {
        environment: "node",
        pool: "vmForks",
        sequence: { groupOrder: 1 },
        watch: false,
        coverage: {
          exclude: [
            ...coverageConfigDefaults.exclude,
            "lib/**",
            "src/**/*.spec.ts",
            "src/context/index.ts",
            "src/context/*.context.ts",
            "src/flows/media/thumbnails/*.type.ts",
            "src/**/*.type.ts",
            "src/**/index.ts",
          ],
        },
      },
      resolve: {
        tsconfigPaths: true,
      },
      plugins: [...(config.plugins ?? [])],
    }),
    config,
  );

  return finalConfig;
};
