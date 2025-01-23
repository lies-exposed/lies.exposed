import { URL } from "url";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, type ViteUserConfig } from "vitest/config";

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
  const toBackendAlias = PathnameAlias(import.meta.url);
  const toAlias = PathnameAlias(root);
  const config = configFn(toAlias);

  return defineConfig({
    root: toAlias("./"),
    test: {
      environment: "node",
      watch: false,
      alias: {
        sharp: toBackendAlias("lib/test/mocks/sharp.mock.js"),
        canvas: toBackendAlias("lib/test/mocks/canvas.mock.js"),
        "pdfjs-dist/legacy/build/pdf.js": toBackendAlias(
          "lib/test/mocks/pdfjs.mock.js",
        ),
        "@blocknote/core": toBackendAlias(
          "lib/test/mocks/blocknote-core.mock.js",
        ),
        "@blocknote/react/**": toBackendAlias(
          "lib/test/mocks/blocknote-react.mock.js",
        ),
      },
      ...config.test,
    },
    plugins: [
      viteTsconfigPaths({
        root: toAlias("./"),
      }) as any,
    ].concat(config.plugins ?? []),
  });
};
