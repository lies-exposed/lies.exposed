import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: 'api-e2e',
    root: __dirname,
    globals: true,
    include: ["src/**/*.e2e.ts"],
    setupFiles: ["./test.setup.ts"],
    globalSetup: `${__dirname}/test/globalSetup.ts`,
    exclude: ["**/build/**", "**/src/migrations/**", "src/scripts"],
    alias: {
      "@react-page/editor": "__mocks__/react-page-editor.mock.ts",
      "@react-page/plugins-slate": "__mocks__/react-page-plugin-slate.mock.ts",
      "@react-page/react-admin": "__mocks__/react-page-react-admin.mock.ts",
    },
    threads: false,
    singleThread: true,
    watch: false
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: "es6" },
    }),
  ],
  // esbuild: false,
  root: __dirname,
});
