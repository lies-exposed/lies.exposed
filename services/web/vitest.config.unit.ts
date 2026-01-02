import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "web-unit",
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    exclude: ["node_modules/**", "build/**", "**/*.e2e.ts"],
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "build/**", "test/**", "**/*.d.ts"],
    },
  },
});
