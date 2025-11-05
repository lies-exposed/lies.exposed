import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanupTestContext } from "./AppTest.js";
import { 
  startTransaction, 
  rollbackTransaction, 
  getInitializedPGliteDataSource 
} from "./utils/pglite-datasource.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";

// Mock external dependencies at the module level
// These mocks apply to all tests
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({})),
  },
}));
vi.mock("page-metadata-parser");
vi.mock("puppeteer-core", () => ({ KnownDevices: {} }));
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@aws-sdk/lib-storage");
vi.mock("node-telegram-bot-api");

const logger = GetLogger("testSetup");

beforeAll(async () => {
  D.enable(process.env.DEBUG ?? "-");

  // Initialize the PGlite DataSource for this worker
  const testFileId = process.env.VITEST_POOL_ID || "default";
  await throwTE(getInitializedPGliteDataSource(`test_${testFileId}`));
  
  logger.debug.log("DataSource initialized for pool ID: %s", process.env.VITEST_POOL_ID);
});

beforeEach(async () => {
  // Start transaction (patches DataSource.manager with QueryRunner.manager getter)
  // Combined with the getter in database.provider.ts, this ensures ALL operations use the transaction
  // This works even when Test is cached in beforeAll
  await startTransaction();
  
  logger.debug.log("Transaction started for test in pool ID: %s", process.env.VITEST_POOL_ID);
});

afterEach(async () => {
  // Rollback the transaction AFTER EACH TEST
  // This is much faster than truncating tables or restoring from snapshot (~1-5ms)
  await rollbackTransaction();
  
  logger.debug.log("Transaction rolled back for test in pool ID: %s", process.env.VITEST_POOL_ID);
});

afterAll(async () => {
  const testFileId = process.env.VITEST_POOL_ID || "default";

  logger.debug.log("Cleaning up test context for pool ID: %s", testFileId);

  // Clean up the test context (no-op, kept for compatibility)
  await cleanupTestContext();
  
  // NOTE: We do NOT close the datasource here!
  // The datasource is cached per-worker and reused across test files
  // Vitest will cleanup when the worker exits

  logger.debug.log("Test cleanup completed for pool ID: %s", testFileId);
});
