import { defineProject } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineProject({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: "web-spec",
    globals: true,
    pool: "vmForks",
    watch: false,
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    exclude: ["node_modules/**", "build/**", "**/*.e2e.ts"],
    root: __dirname,
  },
});
