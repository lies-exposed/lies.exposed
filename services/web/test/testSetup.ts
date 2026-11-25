import * as fs from "fs";
import * as path from "path";
import { beforeAll, afterAll } from "vitest";

// Global test setup
beforeAll(async () => {
  // Set environment variables for testing
  Object.assign(process.env, {
    NODE_ENV: "test",
    VITE_NODE_ENV: "test",
    VITE_DEBUG: "@liexp:*:error",
    VITE_API_URL: "http://mock-api/v1",
    VITE_SSR_API_URL: "http://mock-api/v1",
    VIRTUAL_HOST: "127.0.0.1",
    VIRTUAL_PORT: "0", // Let system assign port
  });

  // Clean up this worker's vite cache directory if it exists. Each worker has
  // its own, as test files run in parallel (see createApp's `cacheDir`).
  const testCacheDir = path.resolve(
    process.cwd(),
    `node_modules/.vite-test-${process.env.VITEST_POOL_ID}`,
  );
  try {
    if (fs.existsSync(testCacheDir)) {
      fs.rmSync(testCacheDir, { recursive: true, force: true });
    }
  } catch {
    // Ignore cleanup errors
  }
});

afterAll(async () => {
  // Cleanup any global resources
});
