import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    watch: false,
    setupFiles: ["./test/testSetup.ts"],
    include: ["test/**/*.e2e.test.ts"],
    exclude: ["node_modules/**", "build/**"],
    reporters: ["verbose"],
    env: {
      NODE_ENV: "test",
    },
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "build/**",
        "test/**",
        "**/*.d.ts",
      ],
    },
  },
  esbuild: {
    target: "node18",
  },
});