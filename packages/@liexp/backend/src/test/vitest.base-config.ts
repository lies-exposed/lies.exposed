import { URL } from "url";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export const PathnameAlias =
  (url: string) =>
  (mockPath: string): string => {
    return new URL(mockPath, url).pathname;
  };

const toAlias = PathnameAlias(import.meta.url);

export const baseConfig = defineConfig({
  root: toAlias("./"),
  test: {
    environment: "node",
    watch: false,
    alias: {
      sharp: toAlias("mocks/sharp.mock.js"),
      canvas: toAlias("mocks/canvas.mock.js"),
      "pdfjs-dist/legacy/build/pdf.js": toAlias("mocks/pdfjs.mock.js"),
      "@blocknote/core": toAlias("mocks/blocknote-core.mock.js"),
      "@blocknote/react/**": toAlias("mocks/blocknote-react.mock.js"),
    },
  },
  plugins: [
    viteTsconfigPaths({
      root: toAlias("./"),
    }),
  ],
});
