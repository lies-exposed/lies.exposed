import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: __dirname,
    globals: true,
    include: ["src/**/*.spec.ts"],
    exclude: ["src/migrations", "src/scripts"],
    alias: {
      "@react-page/editor": "__mocks__/react-page-editor.mock.ts",
      "@react-page/plugins-slate": "__mocks__/react-page-plugin-slate.mock.ts",
      "@react-page/react-admin": "__mocks__/react-page-react-admin.mock.ts",
    },
    watch: false
  },
  plugins: [viteTsconfigPaths()],
  root: __dirname,
});
