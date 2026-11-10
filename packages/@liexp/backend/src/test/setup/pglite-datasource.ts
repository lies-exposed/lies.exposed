import { type PGliteOptions } from "@electric-sql/pglite";
import { unaccent } from "@electric-sql/pglite/contrib/unaccent";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import * as TE from "fp-ts/lib/TaskEither.js";
import { DataSource } from "typeorm";
import { PGliteDriver } from "typeorm-pglite";
import {
  toDBError,
  type DBError,
} from "../../providers/orm/database.provider.js";
import { createORMConfig } from "../../utils/data-source.js";

/**
 * Per-worker cache: each vitest worker owns one in-memory PGlite instance,
 * schema created once via `synchronize`, test isolation via transactions
 * (see `transactional-db.ts`).
 */
const workerDataSources = new Map<string, DataSource>();

const getWorkerId = (): string => process.env.VITEST_POOL_ID ?? "default";

const getPGliteOptions = (workerId: string): PGliteOptions => ({
  dataDir: `memory://test-worker-${workerId}`,
  extensions: { uuid_ossp, unaccent },
});

/**
 * Create (once per worker) and return an initialized PGlite-backed DataSource.
 */
export const getInitializedPGliteDataSource = (): TE.TaskEither<
  DBError,
  DataSource
> =>
  TE.tryCatch(async () => {
    const workerId = getWorkerId();
    const cached = workerDataSources.get(workerId);
    if (cached?.isInitialized) {
      return cached;
    }

    const dataSource = new DataSource(
      createORMConfig(
        {
          type: "postgres",
          // type assertion: PGlite types resolve differently across packages
          driver: new PGliteDriver(getPGliteOptions(workerId)).driver,
          database: `test-worker-${workerId}`,
          logging: false,
        },
        { synchronize: true },
      ),
    );
    await dataSource.initialize();
    // extensions registered in PGliteOptions are not auto-created by synchronize
    await dataSource.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);

    workerDataSources.set(workerId, dataSource);
    return dataSource;
  }, toDBError());
