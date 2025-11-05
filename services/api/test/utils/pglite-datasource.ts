import { PGliteDriver } from "typeorm-pglite";
import { DataSource, type DataSourceOptions, type QueryRunner } from "typeorm";
import { type PGliteOptions } from "@electric-sql/pglite";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toDBError, type DBError, type DatabaseClient } from "@liexp/backend/lib/providers/orm/database.provider.js";
import { GetDatabaseClient } from "@liexp/backend/lib/providers/orm/index.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { createORMConfig } from "@liexp/backend/lib/utils/data-source.js";

// Per-worker cache for PGlite datasource (each worker reuses its instance across tests)
const workerDataSources = new Map<string, DataSource>();
const workerSchemaInitialized = new Map<string, boolean>();
const workerQueryRunners = new Map<string, QueryRunner>();
const workerTransactionActive = new Map<string, boolean>();
const workerTransactionalDBs = new Map<string, DatabaseClient>();
const workerOriginalManagers = new Map<string, import("typeorm").EntityManager>();

/**
 * Get worker ID for instance isolation
 */
const getWorkerId = (): string => {
  return process.env.VITEST_POOL_ID || "default";
};

/**
 * Get PGlite configuration options for a specific worker
 * Each worker gets its own isolated PGlite instance
 */
const getPGliteOptions = (workerId: string): PGliteOptions => {
  return {
    dataDir: `memory://test-worker-${workerId}`,
    extensions: {
      uuid_ossp,
    },
  };
};

/**
 * Create a transactional DatabaseClient from a QueryRunner
 * All database operations will go through the transaction
 * This is a clean approach that doesn't require patching the DataSource
 */
const createTransactionalDatabaseClient = (
  queryRunner: QueryRunner,
): DatabaseClient => {
  const logger = GetLogger("typeorm-transaction");
  logger.info.log("🔄 Creating transactional DatabaseClient from QueryRunner");
  
  // Create a pseudo-DataSource that uses the QueryRunner's manager
  // This makes GetDatabaseClient use the transactional EntityManager
  const transactionalConnection = {
    manager: queryRunner.manager, // ← Key: Use QueryRunner's transactional manager
    driver: queryRunner.connection.driver,
    options: queryRunner.connection.options,
    isInitialized: true,
  } as DataSource;

  const client = GetDatabaseClient({
    connection: transactionalConnection,
    logger,
  });
  
  logger.info.log("✅ Transactional DatabaseClient created with manager: %s", 
    queryRunner.manager.constructor.name);
  
  return client;
};

/**
 * Start a transaction for the current test file
 * Uses "hard patch" approach: replaces DataSource.manager with QueryRunner.manager getter
 * Combined with the getter in database.provider.ts, this ensures ALL operations use the transaction
 * This is the most reliable approach that works with tests caching Test in beforeAll
 */
export const startTransaction = async (): Promise<void> => {
  const workerId = getWorkerId();
  const dataSource = workerDataSources.get(workerId);
  
  if (!dataSource || !dataSource.isInitialized) {
    throw new Error(`DataSource not initialized for worker ${workerId}`);
  }

  // Always create a fresh query runner for each test
  // This prevents EventEmitter memory leaks from accumulated listeners
  const queryRunner = dataSource.createQueryRunner();
  workerQueryRunners.set(workerId, queryRunner);

  // Start transaction
  await queryRunner.startTransaction();
  workerTransactionActive.set(workerId, true);
  
  // **HARD PATCH**: Replace DataSource.manager with QueryRunner.manager getter
  // This combined with the getter in database.provider.ts ensures transactional isolation
  // even when ctx.db was created before the transaction started (in beforeAll)
  const originalManager = dataSource.manager;
  workerOriginalManagers.set(workerId, originalManager);
  
  Object.defineProperty(dataSource, 'manager', {
    get: () => queryRunner.manager,
    configurable: true,
  });
  
  const logger = GetLogger("pglite-transaction");
  logger.info.log("🔒 Transaction started with hard-patched manager for worker: %s", workerId);
};

/**
 * Rollback the transaction and restore the original manager
 * This is much faster than snapshot restoration (~1-5ms vs ~500ms)
 */
export const rollbackTransaction = async (): Promise<void> => {
  const workerId = getWorkerId();
  const queryRunner = workerQueryRunners.get(workerId);
  const dataSource = workerDataSources.get(workerId);
  const originalManager = workerOriginalManagers.get(workerId);
  const isActive = workerTransactionActive.get(workerId);
  
  if (queryRunner) {
    // Rollback transaction if active
    if (isActive) {
      await queryRunner.rollbackTransaction();
      workerTransactionActive.set(workerId, false);
    }
    
    // Restore original manager
    if (originalManager && dataSource) {
      Object.defineProperty(dataSource, 'manager', {
        value: originalManager,
        writable: true,
        configurable: true,
      });
    }
    
    const logger = GetLogger("pglite-transaction");
    logger.info.log("🔓 Transaction rolled back, manager restored for worker: %s", workerId);
    
    // Release the query runner to clean up event listeners
    await queryRunner.release();
    workerQueryRunners.delete(workerId);
    workerTransactionalDBs.delete(workerId);
    workerOriginalManagers.delete(workerId);
  }
};

/**
 * Get PGlite-based TypeORM configuration for tests
 * Each worker caches its instance and reuses it across tests
 */
const getPGliteORMConfig = (workerId: string): DataSourceOptions => {
  const pgliteOptions = getPGliteOptions(workerId);
  const isInitialized = workerSchemaInitialized.get(workerId) || false;
  
  return createORMConfig(
    {
      type: "postgres",
      // Pass PGlite options to the driver so it creates the instance with proper configuration
      // Type assertion needed due to PGlite internal type resolution issues between packages
      // The driver and extension work correctly at runtime
      driver: new PGliteDriver(pgliteOptions as any).driver,
      database: `test-worker-${workerId}`,
      logging: false,
    },
    {
      // Synchronize only on first use per worker
      synchronize: !isInitialized,
    }
  );
};

/**
 * Ensure a DataSource is initialized for the current worker
 * This is a prerequisite for starting transactions
 * Returns the DataSource synchronously (it's already cached)
 */
const ensureDataSourceInitialized = async (dbName: string): Promise<DataSource> => {
  const workerId = getWorkerId();
  
  // Check if we already have an initialized DataSource
  const existing = workerDataSources.get(workerId);
  if (existing && existing.isInitialized) {
    return existing;
  }
  
  // Initialize if not already done
  return throwTE(getInitializedPGliteDataSource(dbName));
};

/**
 * Create and initialize a PGlite-based DataSource with fp-ts TaskEither
 * Uses per-worker caching with transaction-based isolation
 * First test: ~4.5s (schema sync), subsequent tests: ~1-5ms (transaction rollback)
 */
export const getInitializedPGliteDataSource = (
  _dbName: string, // Kept for API compatibility but not used (worker instance)
): TE.TaskEither<DBError, DataSource> => {
  return TE.tryCatch(
    async () => {
      const workerId = getWorkerId();
      
      // Return cached datasource if available
      const cachedDataSource = workerDataSources.get(workerId);
      if (cachedDataSource && cachedDataSource.isInitialized) {
        return cachedDataSource;
      }
      
      // First initialization for this worker: create schema
      const config = getPGliteORMConfig(workerId);
      const dataSource = new DataSource(config);
      
      // Initialize TypeORM - PGliteDriver will create the PGlite instance with uuid_ossp extension
      // This will run synchronize on first call for this worker
      await dataSource.initialize();
      
      // Mark schema as initialized and cache the datasource for this worker
      workerSchemaInitialized.set(workerId, true);
      workerDataSources.set(workerId, dataSource);
      
      return dataSource;
    },
    toDBError(),
  );
};

/**
 * Close the cached datasource for current worker (call this in global teardown)
 */
const closeCachedDataSource = async (): Promise<void> => {
  const workerId = getWorkerId();
  
  // Release query runner
  const queryRunner = workerQueryRunners.get(workerId);
  if (queryRunner) {
    // Rollback any active transaction
    const isActive = workerTransactionActive.get(workerId);
    if (isActive) {
      await queryRunner.rollbackTransaction();
    }
    await queryRunner.release();
    workerQueryRunners.delete(workerId);
    workerTransactionActive.delete(workerId);
  }
  
  // Close datasource
  const cachedDataSource = workerDataSources.get(workerId);
  if (cachedDataSource && cachedDataSource.isInitialized) {
    await cachedDataSource.destroy();
    workerDataSources.delete(workerId);
    workerSchemaInitialized.delete(workerId);
  }
};

