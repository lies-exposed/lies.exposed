import swc from "unplugin-swc";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export const baseConfig = defineConfig({
  root: __dirname,
  test: {
    environment: 'node',
    watch: false,
    alias: {
      "@react-page/editor/**": "__mocks__/react-page-editor.mock.ts",
      "@react-page/plugins-slate/**":
        "__mocks__/react-page-plugin-slate.mock.ts",
      "@react-page/react-admin/**":
        "__mocks__/react-page-react-admin.mock.ts",
    },
  },
  plugins: [
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: "es6" },
    }),
    viteTsconfigPaths({
      root: __dirname
    }),
  ],
});
