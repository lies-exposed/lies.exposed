import { URL } from "url";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export const PathnameAlias = (url: string) =>  (mockPath: string): string => {
  return new URL(mockPath, url).pathname;
};

const toAlias = PathnameAlias(import.meta.url)

export const baseConfig = defineConfig({
  root: toAlias('./'),
  test: {
    environment: "node",
    watch: false,
    alias: {
      sharp: toAlias("test/__mocks__/sharp.mock.ts"),
      canvas: toAlias("test/__mocks__/canvas.mock.ts"),
      "pdfjs-dist/legacy/build/pdf.js": toAlias("test/__mocks__/pdfjs.mock.ts"),
      "@react-page/editor/**": toAlias(
        "test/__mocks__/react-page-editor.mock.ts",
      ),
      "@react-page/plugins-slate/**": toAlias(
        "test/__mocks__/react-page-plugin-slate.mock.ts",
      ),
      "@react-page/react-admin/**": toAlias(
        "test/__mocks__/react-page-react-admin.mock.ts",
      ),
    },
  },
  plugins: [
    viteTsconfigPaths({
      root: __dirname
    }),
  ],
});
