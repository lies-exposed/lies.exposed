import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: __dirname,
    globals: true,
    include: [__dirname + "/src/**/*.spec.ts"],
  },
  plugins: [viteTsconfigPaths()],
  root: __dirname,
});
