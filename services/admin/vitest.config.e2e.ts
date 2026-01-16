import path from "node:path";
import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: "e2e",
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ["./test/testSetup.ts"],
    include: ["test/**/*.e2e.test.ts"],
    exclude: ["node_modules/**", "build/**"],
    root: __dirname,
    env: {
      NODE_ENV: "test",
    },
    // Run test files sequentially to avoid Vite cache conflicts
    fileParallelism: false,
  },
  esbuild: {
    target: "node18",
  },
});
