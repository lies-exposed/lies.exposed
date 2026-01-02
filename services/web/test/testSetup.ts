import * as fs from "fs";
import * as path from "path";
import { beforeAll, afterAll } from "vitest";

// Global test setup
beforeAll(async () => {
  // Set environment variables for testing
  Object.assign(process.env, {
    NODE_ENV: "test",
    VITE_NODE_ENV: "test",
    // VITE_DEBUG: "@liexp:*:error",
    VITE_DEBUG: "@liexp:*",
    VITE_API_URL: "http://mock-api/v1",
    VITE_SSR_API_URL: "http://mock-api/v1",
    VIRTUAL_HOST: "127.0.0.1",
    VIRTUAL_PORT: "0", // Let system assign port
  });

  // Clean up the test-specific vite cache directory if it exists
  const testCacheDir = path.resolve(process.cwd(), "node_modules/.vite-test");
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
