import { defineProject } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: "web-spec",
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    exclude: ["node_modules/**", "build/**", "**/*.e2e.ts"],
  },
});
