import * as path from "path";
import * as dotenv from "dotenv";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { getInitializedPGliteDataSource } from "./utils/pglite-datasource.js";

const logger = GetLogger("globalSetup");

/**
 * Global setup for e2e tests using PGlite (in-memory PostgreSQL).
 * Loads .env.test and initializes PGlite datasource.
 */
export default async () => {
  try {
    // Load test environment variables
    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ?? path.join(__dirname, "../.env.test"),
    );
    dotenv.config({ path: dotenvConfigPath });

    // Initialize PGlite datasource for global context
    const workerId = process.env.VITEST_POOL_ID || "global";
    await throwTE(getInitializedPGliteDataSource(`global_${workerId}`));
    logger.info.log("PGlite global setup completed for worker: %s", workerId);
  } catch (e) {
    logger.error.log("Global setup error (non-fatal, testSetup will retry):", e);
  }

  // No-op teardown - PGlite datasource is managed per-worker in testSetup.ts
  return () => Promise.resolve();
};
