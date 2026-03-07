import { defineProject } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: "web-spec",
    globals: true,
    watch: false,
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    exclude: ["node_modules/**", "build/**", "**/*.e2e.ts"],
    root: __dirname,
    coverage: {
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.e2e.ts", "node_modules/**", "build/**"],
      // The only existing spec is a static code-inspection test (fs.readFileSync).
      // No source paths are instrumented, so coverage stays at 0%.
      // TODO: add real unit tests and raise thresholds to 80%.
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
