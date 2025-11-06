import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { DataSource, type QueryRunner } from "typeorm";

/**
 * Per-worker cache for transactional DB state
 * Each worker maintains its own query runner and transaction state
 */
const workerQueryRunners = new Map<string, QueryRunner>();
const workerTransactionActive = new Map<string, boolean>();
const workerOriginalManagers = new Map<string, import("typeorm").EntityManager>();

/**
 * Get worker ID for instance isolation
 */
const getWorkerId = (): string => {
  return process.env.VITEST_POOL_ID || "default";
};

/**
 * Get the DataSource and DatabaseClient from the global app context
 * This assumes they were already initialized in the global setup
 */
const getContext = (): { dataSource?: DataSource; db?: any } => {
  const g = global as unknown as {
    appContext?: { db?: { manager?: { connection?: DataSource } } };
    appTest?: { ctx?: { db?: { manager?: { connection?: DataSource } } } };
  };

  // Try to get from appContext first (set by testSetup.ts)
  let dataSource = g.appContext?.db?.manager?.connection;
  let db = g.appContext?.db;
  
  // If not found, try from appTest (set by individual tests)
  if (!dataSource || !dataSource.isInitialized) {
    dataSource = g.appTest?.ctx?.db?.manager?.connection;
    db = g.appTest?.ctx?.db;
  }
  
  return { dataSource, db };
};

/**
 * Start a transaction for the current test
 * Uses "hard patch" approach: replaces both DataSource.manager and ctx.db.manager 
 * with QueryRunner.manager getter. This ensures ALL operations use the transaction,
 * including HTTP requests that go through ctx.db.manager
 */
export const startTransaction = async (): Promise<void> => {
  const workerId = getWorkerId();
  const { dataSource, db } = getContext();

  // If DataSource is not available (test is skipped or not initialized), skip transaction
  if (!dataSource || !dataSource.isInitialized) {
    return;
  }

  // Always create a fresh query runner for each test
  // This prevents EventEmitter memory leaks from accumulated listeners
  const queryRunner = dataSource.createQueryRunner();
  workerQueryRunners.set(workerId, queryRunner);

  // Start transaction
  await queryRunner.startTransaction();
  workerTransactionActive.set(workerId, true);

  // **HARD PATCH 1**: Replace DataSource.manager with QueryRunner.manager getter
  const originalManager = dataSource.manager;
  workerOriginalManagers.set(workerId, originalManager);

  Object.defineProperty(dataSource, "manager", {
    get: () => queryRunner.manager,
    configurable: true,
  });

  // **HARD PATCH 2**: ALSO patch ctx.db.manager to use the transactional manager
  // This is crucial because HTTP requests use ctx.db.manager, which is a cached reference
  if (db) {
    Object.defineProperty(db, "manager", {
      get: () => queryRunner.manager,
      configurable: true,
    });
  }

  const logger = GetLogger("transactional-db");
  logger.info.log(
    "🔒 Transaction started with hard-patched managers (DataSource + ctx.db) for worker: %s",
    workerId,
  );
};

/**
 * Rollback the transaction and restore the original manager
 * This is much faster than truncating tables (~1-5ms vs ~500ms)
 */
export const rollbackTransaction = async (): Promise<void> => {
  const workerId = getWorkerId();
  const queryRunner = workerQueryRunners.get(workerId);
  const { dataSource, db } = getContext();
  const originalManager = workerOriginalManagers.get(workerId);
  const isActive = workerTransactionActive.get(workerId);

  if (!queryRunner) {
    return;
  }

  if (!dataSource || !dataSource.isInitialized) {
    // Still release the query runner before returning
    await queryRunner.release();
    workerQueryRunners.delete(workerId);
    workerOriginalManagers.delete(workerId);
    return;
  }

  // Rollback transaction if active
  if (isActive) {
    await queryRunner.rollbackTransaction();
    workerTransactionActive.set(workerId, false);
  }

  // Restore original managers
  if (originalManager) {
    // Restore DataSource.manager
    Object.defineProperty(dataSource, "manager", {
      value: originalManager,
      writable: true,
      configurable: true,
    });
    
    // Also restore ctx.db.manager if it exists
    if (db) {
      Object.defineProperty(db, "manager", {
        value: originalManager,
        writable: true,
        configurable: true,
      });
    }
  }

  const logger = GetLogger("transactional-db");
  logger.info.log(
    "🔓 Transaction rolled back, managers restored for worker: %s",
    workerId,
  );

  // Release the query runner to clean up event listeners
  await queryRunner.release();
  workerQueryRunners.delete(workerId);
  workerOriginalManagers.delete(workerId);
};

/**
 * Commit the transaction and restore the original managers
 * Used for tests that need to verify data persistence across tests
 */
export const commitTransaction = async (): Promise<void> => {
  const workerId = getWorkerId();
  const queryRunner = workerQueryRunners.get(workerId);
  const { dataSource, db } = getContext();
  const originalManager = workerOriginalManagers.get(workerId);
  const isActive = workerTransactionActive.get(workerId);

  // If no query runner or DataSource, nothing to commit
  if (!queryRunner || !dataSource || !dataSource.isInitialized) {
    return;
  }

  // Commit transaction if active
  if (isActive) {
    await queryRunner.commitTransaction();
    workerTransactionActive.set(workerId, false);
  }

  // Restore original managers
  if (originalManager) {
    // Restore DataSource.manager
    Object.defineProperty(dataSource, "manager", {
      value: originalManager,
      writable: true,
      configurable: true,
    });
    
    // Also restore ctx.db.manager if it exists
    if (db) {
      Object.defineProperty(db, "manager", {
        value: originalManager,
        writable: true,
        configurable: true,
      });
    }
  }

  const logger = GetLogger("transactional-db");
  logger.info.log(
    "✅ Transaction committed, managers restored for worker: %s",
    workerId,
  );

  // Release the query runner to clean up event listeners
  await queryRunner.release();
  workerQueryRunners.delete(workerId);
  workerOriginalManagers.delete(workerId);
};

/**
 * Clean up all transactional state for the current worker
 * Should be called in global teardown or afterAll
 */
export const cleanupTransactionalState = async (): Promise<void> => {
  const workerId = getWorkerId();

  // Rollback any active transaction
  await rollbackTransaction();

  // Clean up all cached state
  workerQueryRunners.delete(workerId);
  workerTransactionActive.delete(workerId);
  workerOriginalManagers.delete(workerId);

  const logger = GetLogger("transactional-db");
  logger.info.log("🧹 Cleaned up transactional state for worker: %s", workerId);
};

