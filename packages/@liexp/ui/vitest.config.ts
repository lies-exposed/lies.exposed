import path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: 'ui',
    root: __dirname,
    globals: true,
    watch: false,
    environment: 'jsdom',
    setupFiles: ['./test.setup.js'],
    include: [path.join(__dirname, "/src/**/*.spec.{ts,tsx}")],
    coverage: {
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      }
    }
  },
  plugins: [viteTsconfigPaths()],
  root: __dirname,
});
