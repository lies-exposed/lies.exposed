import path from "path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "api-e2e",
    root: __dirname,
    globals: true,
    include: ["src/**/*.e2e.ts"],
    setupFiles: [`${__dirname}/test/testSetup.ts`],
    globalSetup: `${__dirname}/test/globalSetup.ts`,
    exclude: ["**/build/**", "**/src/migrations/**", "**/src/scripts"],
    coverage: {
      exclude: ["**/@liexp/*/lib/**", "**/__mocks__/**"],
    },
    alias: {
      // "@react-page/editor": "__mocks__/react-page-editor.mock.ts",
      // "@react-page/plugins-slate": "__mocks__/react-page-plugin-slate.mock.ts",
      // "@react-page/react-admin": "__mocks__/react-page-react-admin.mock.ts",
      "@liexp/core/lib": path.resolve(
        __dirname,
        "../../packages/@liexp/core/src"
      ),
      "@liexp/shared/lib": path.resolve(
        __dirname,
        "../../packages/@liexp/shared/src"
      ),
      "@liexp/backend/lib": path.resolve(
        __dirname,
        "../../packages/@liexp/backend/src"
      ),
    },
    threads: false,
    singleThread: true,
    watch: false,
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: "es6" },
    }),
  ],
  root: __dirname,
});
