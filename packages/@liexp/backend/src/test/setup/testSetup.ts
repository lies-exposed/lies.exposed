import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import D from "debug";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import {
  startTransaction,
  rollbackTransaction,
  cleanupTransactionalState,
} from "./transactional-db.js";

const logger = GetLogger("testSetup");

/**
 * Generic test setup factory for e2e tests with transaction management
 *
 * @param loadAppContext - Function to load the service-specific app context
 * @param initAppTest - Function to initialize the service-specific app test
 *
 * Note: Mock modules using vi.mock() at the top level of your testSetup.ts file before calling this function.
 * Vitest requires mocks to be hoisted before module imports are resolved.
 */
export const createTestSetup = <TContext, TAppTest>(
  loadAppContext: (logger: any, database: string) => Promise<TContext>,
  initAppTest: (ctx: TContext, database: string) => Promise<TAppTest>,
) => {
  const g = global as unknown as { appContext: TContext; appTest?: TAppTest };

  beforeAll(async () => {
    D.enable(process.env.DEBUG ?? "-");

    const database = process.env.DB_DATABASE!;

    if (!g.appContext) {
      logger.debug.log("loading app context for database: %s", database);
      g.appContext = await loadAppContext(logger, database);
    }

    logger.debug.log("app context initialized", !!g.appContext, database);

    g.appTest = await initAppTest(g.appContext, database);
  });

  beforeEach(async () => {
    // Start transaction for this test
    // This patches DataSource.manager with QueryRunner.manager getter
    // All operations will use the transactional manager
    await startTransaction();

    logger.debug.log(
      "Transaction started for test in pool ID: %s",
      process.env.VITEST_POOL_ID,
    );
  });

  afterEach(async () => {
    // Rollback the transaction AFTER EACH TEST
    // This is much faster than truncating tables (~1-5ms vs ~500ms)
    await rollbackTransaction();

    logger.debug.log(
      "Transaction rolled back for test in pool ID: %s",
      process.env.VITEST_POOL_ID,
    );
  });

  afterAll(async () => {
    // Clean up transactional state
    await cleanupTransactionalState();

    // NOTE: We do NOT close the DB connection here!
    // Multiple test files share the same global context (isolate: false in vitest config)
    // Closing the connection would break subsequent test files
    // The connection will be closed when the worker process exits

    // For now, just clear the app test reference
    g.appTest = undefined;
  });
};
