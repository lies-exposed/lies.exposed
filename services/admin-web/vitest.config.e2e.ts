import { defineProject } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: 'e2e',
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ["./test/testSetup.ts"],
    include: ["test/**/*.e2e.test.ts"],
    exclude: ["node_modules/**", "build/**"],
    env: {
      NODE_ENV: "test",
    },
  },
  esbuild: {
    target: "node18",
  },
});