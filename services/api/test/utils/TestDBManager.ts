import { RedisClient } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Logger } from "@liexp/core/lib/logger/Logger.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import Docker from "dockerode";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { TaskEither } from "fp-ts/lib/TaskEither.js";
import * as Redis from "ioredis";
import * as pg from "pg";

interface TestDBManager {
  lookup: () => Promise<Docker.Container | undefined>;
  listDatabases: () => Promise<readonly string[]>;
  startDBTruncator: () => Promise<NodeJS.Timeout>;
  addDatabases: (dbCount: number) => Promise<readonly string[]>;
  waitForDatabase: () => Promise<string>;
  getRunStats: () => Promise<{ used: number }>;
  releaseDatabaseAndClose: (database: string) => Promise<void>;
  freeDatabases: () => Promise<void>;
  close: () => Promise<void>;
}

type TE<T> = TaskEither<Error, T>;

interface TestDBManagerContext {
  docker: Docker;
  logger: Logger;
  pg: (dbName?: string) => TE<pg.Client>;
  redis: Redis.Redis;
}

type RTE<T> = ReaderTaskEither<TestDBManagerContext, Error, T>;

const liftP = <T>(p: () => Promise<T>): TE<T> => {
  return pipe(
    fp.TE.tryCatch(
      () => p(),
      (e) => new Error(`Error caught`, { cause: e }),
    ),
  );
};

/**
 * Redis Keys
 */

const RUN_STATS_KEY = "run-stats";

const DB_STATE = {
  FREE: 0,
  IN_USE: 1,
  TO_TRUNCATE: 2,
};

const lookupDBContainer =
  (containerName: string): RTE<Docker.Container> =>
  (ctx) => {
    return pipe(
      liftP(() => ctx.docker.listContainers({ all: true })),
      LoggerService.TE.debug(ctx, (containers) => [
        "Look for %s in %O",
        containerName,
        containers.map((c) => c.Names),
      ]),
      fp.TE.map((containers) =>
        containers.find((c) =>
          c.Names.some((n) => n.indexOf(containerName) > 0),
        ),
      ),
      fp.TE.filterOrElse(
        (containerInfo) => !!containerInfo,
        () => new Error(`Container ${containerName} not found`),
      ),
      fp.TE.map((containerInfo) => ctx.docker.getContainer(containerInfo.Id)),
      fp.RTE.fromTaskEither,
    )(ctx);
  };

const listDatabases =
  (dbName: string): RTE<string[]> =>
  (ctx) => {
    return pipe(
      ctx.pg(dbName),
      fp.TE.chain((pg) =>
        liftP(async () => {
          const databases = await pg.query(
            `select * from pg_catalog.pg_database pd where datname like '${dbName}%'`,
          );

          return databases.rows
            .map((db) => db.datname)
            .filter((db) => db !== dbName);
        }),
      ),
    );
  };

// const dropDatabase =
//   (dbName: string) =>
//   (pg: pg.Client): TE<string> => {
//     return pipe(
//       liftP(async () => {
//         const result = await pg.query(`DROP DATABASE ${dbName}`);

//         if (result.command !== "DROP") {
//           throw new Error(`Failed to drop database ${dbName}`);
//         }

//         return result.command;
//       }),
//       // LoggerService.TE.debug(ctx, () => ["Dropped database %s", dbName]),
//     );
//   };

const createDatabase =
  (dbName: string): RTE<string> =>
  (ctx) => {
    return pipe(
      ctx.pg(dbName),
      fp.TE.chain((pg) =>
        liftP(async () => {
          const result = await pg.query(`CREATE DATABASE ${dbName}`);

          if (result.command !== "CREATE") {
            throw new Error(`Failed to create database ${dbName}`);
          }

          return result.command;
        }),
      ),
      // LoggerService.TE.debug(ctx, () => ["Created database %s", dbName]),
    );
  };

const addDatabases =
  (dbNamePattern: string) =>
  (dbCount: number): RTE<readonly string[]> =>
  (ctx) => {
    return pipe(
      listDatabases(dbNamePattern)(ctx),
      fp.TE.chain((databases) => {
        const newDatabases = Array.from(
          { length: dbCount },
          (_, i) => `${dbNamePattern}_${i}`,
        );

        ctx.logger.debug.log("Adding databases: %O", newDatabases);

        return pipe(
          newDatabases,
          fp.A.filter((db) => !databases.includes(db)),
          fp.A.traverse(fp.TE.ApplicativePar)((db) => createDatabase(db)(ctx)),
        );
      }),
    );
  };

const firstFreeDatabase =
  (keys: string[]): RTE<string | undefined> =>
  (ctx) => {
    return pipe(
      liftP(async () => {
        for (const db of keys) {
          const isUsed = await ctx.redis.get(db);

          ctx.logger.info.log("Found database %s with isUsed %s", db, isUsed);
          if (isUsed && parseInt(isUsed) === DB_STATE.FREE) {
            return db;
          }
        }
        return undefined;
      }),
      fp.RTE.fromTaskEither,
    )(ctx);
  };

const firstDatabaseToTruncate =
  (keys: string[]): RTE<string | undefined> =>
  (ctx) => {
    return pipe(
      liftP(async () => {
        for (const db of keys) {
          const dbStatus = await ctx.redis.get(db);

          if (dbStatus && parseInt(dbStatus) === DB_STATE.TO_TRUNCATE) {
            ctx.logger.info.log("Found database to truncate %s", db);

            return db;
          }
        }
        return undefined;
      }),
      fp.RTE.fromTaskEither,
    )(ctx);
  };

/**
 * Wait for a free database to be available.
 * It seems it can't be less than 500ms,
 */
const WAIT_FOR_DB_INTERVAL = 200;
const waitForDatabase =
  (dbName: string): RTE<string> =>
  (ctx) => {
    return pipe(
      liftP(
        () =>
          new Promise(async (resolve, reject) => {
            let retries = 1000;

            const stats = await ctx.redis
              .get(RUN_STATS_KEY)
              .then((s) => (s ? JSON.parse(s) : null));
            const statsPairs: [string, number][] = stats
              ? Object.entries(stats)
              : [];
            const orderedKeys = pipe(
              statsPairs,
              fp.A.sortBy([
                pipe(
                  fp.N.Ord,
                  fp.Ord.contramap(([_, v]: [string, number]) => v),
                ),
              ]),
            ).map(([k]) => k);

            const databaseTimer = setInterval(async () => {
              const freeDatabase = await pipe(
                firstFreeDatabase(orderedKeys)(ctx),
                throwTE,
              );

              pipe(
                freeDatabase,
                fp.O.fromNullable,
                fp.O.fold(
                  () => {
                    retries--;

                    if (retries === 0) {
                      clearInterval(databaseTimer);
                      reject(new Error("No free database found"));
                    }

                    ctx.logger.debug.log(
                      `No DB free, waiting for ${WAIT_FOR_DB_INTERVAL} more...`,
                    );
                  },
                  (database) => {
                    ctx.logger.debug.log("Found free database %s", database);

                    void ctx.redis.set(database, DB_STATE.IN_USE).then(() => {
                      resolve(database);
                      clearInterval(databaseTimer);
                    });
                  },
                ),
              );
            }, WAIT_FOR_DB_INTERVAL);
          }),
      ),
    );
  };

let truncatorInterval: NodeJS.Timeout;

const dbTruncator = (dbName: string, tables: string[]): RTE<NodeJS.Timeout> => {
  return (ctx) => {
    if (truncatorInterval) {
      console.log("truncator already running");
      return fp.TE.right(truncatorInterval);
    }

    let isTruncating = false;

    truncatorInterval = setInterval(async () => {
      void pipe(
        fp.TE.Do,
        fp.TE.bind("firstDBToTruncate", () =>
          pipe(
            databaseNameKeys(dbName)(ctx),
            fp.TE.chain((databases) => firstDatabaseToTruncate(databases)(ctx)),
          ),
        ),
        fp.TE.chain(({ firstDBToTruncate }) => {
          if (!firstDBToTruncate || isTruncating) {
            return fp.TE.right(undefined);
          }

          ctx.logger.debug.log("Truncating %s", firstDBToTruncate);

          isTruncating = true;

          return pipe(
            ctx.pg(firstDBToTruncate),
            fp.TE.chain(truncateTables(tables)),
            fp.TE.map(() => {
              isTruncating = false;
            }),
          );
        }),
        throwTE,
      );
    }, 300);

    return fp.TE.right(truncatorInterval);
  };
};

const freeDatabases =
  (dbName: string): RTE<void> =>
  (ctx) => {
    return pipe(
      databaseNameKeys(dbName)(ctx),
      fp.TE.chain(
        flow(
          fp.A.traverse(fp.TE.ApplicativePar)((dbName) =>
            liftP(() => ctx.redis.set(dbName, DB_STATE.FREE)),
          ),
        ),
      ),
      fp.TE.map(() => undefined),
    );
  };

const databaseNameKeys =
  (dbNamePattern: string): RTE<string[]> =>
  (ctx) => {
    return pipe(liftP(() => ctx.redis.keys(`${dbNamePattern}*`)));
  };

const resetKeys =
  (dbNamePattern: string): RTE<void> =>
  (ctx) => {
    return pipe(
      databaseNameKeys(dbNamePattern),
      fp.RTE.chainTaskEitherK((dbKeys) =>
        liftP(async () => {
          await Promise.all(dbKeys.map((key) => ctx.redis.del(key)));
          await ctx.redis.set(
            RUN_STATS_KEY,
            JSON.stringify({
              used: 0,
              ...dbKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
            }),
          );
        }),
      ),
    )(ctx);
  };

const addKeys =
  (dbNamePattern: string, count: number): RTE<void> =>
  (ctx) => {
    return pipe(
      liftP(async () => {
        const dbKeys = Array.from(
          { length: count },
          (_, i) => `${dbNamePattern}_${i}`,
        );
        await Promise.all(
          dbKeys.map((key) => ctx.redis.set(key, DB_STATE.FREE)),
        );
      }),
    );
  };

const releaseDatabaseAndClose =
  (dbName: string, tables: string[]): RTE<void> =>
  (ctx) => {
    return pipe(
      sequenceS(fp.TE.ApplicativePar)({
        runStats: liftP(async () => {
          const stats = await ctx.redis.get(RUN_STATS_KEY);
          const jsonStats = stats
            ? JSON.parse(stats)
            : { [dbName]: 0, used: 0 };

          await ctx.redis.set(
            RUN_STATS_KEY,
            JSON.stringify({
              ...jsonStats,
              [dbName]: (jsonStats[dbName] ?? 0) + 1,
              used: parseInt(jsonStats.used) + 1,
            }),
          );
        }),
      }),
      fp.TE.chain(() =>
        liftP(() => ctx.redis.set(dbName, DB_STATE.TO_TRUNCATE)),
      ),
      fp.TE.chain(() => close(ctx)),
      fp.TE.map(() => undefined),
    );
  };

const truncateTable =
  (tableName: string) =>
  (pg: pg.Client): TE<boolean> =>
    liftP(async () => {
      const result = await pg.query(`TRUNCATE "${tableName}" CASCADE;`);
      return result?.command === "TRUNCATE";
    });

const truncateTables =
  (tables: readonly string[]) =>
  (pg: pg.Client): TE<void> => {
    return pipe(
      tables,
      fp.A.traverse(fp.TE.ApplicativeSeq)((table) => truncateTable(table)(pg)),
      fp.TE.filterOrElse(
        fp.A.every((b) => b === true),
        () => new Error("Failed to truncate tables"),
      ),
      fp.TE.map(() => undefined),
    );
  };

const close: RTE<void> = (ctx) => {
  return pipe(
    sequenceS(fp.TE.ApplicativePar)({
      pg: pipe(
        ctx.pg(),
        fp.TE.chain((pg) => liftP(() => pg.end())),
      ),
      redis: liftP(() => ctx.redis.quit()),
    }),
    fp.TE.map(() => undefined),
  );
};

interface TestDBManagerOptions {
  dbContainerName: string;
  redis: {
    host: string;
  };
  truncateTables: string[];
}

const getPGClient = (dbName: string) => {
  let pgClient: pg.Client | undefined;
  return (dbNameOverride?: string): TE<pg.Client> => {
    return liftP(async () => {
      if (pgClient) {
        return pgClient;
      }
      pgClient = new pg.Client({
        host: "127.0.0.1",
        port: parseInt(process.env.DB_PORT || "8432"),
        user: "liexp",
        password: "liexp-password",
        database: dbNameOverride ?? dbName,
      });

      await pgClient.connect();

      return pgClient;
    });
  };
};

export const GetTestDBManager = (
  logger: Logger,
  opts: TestDBManagerOptions,
) => {
  return async (dbNamePattern: string): Promise<TestDBManager> => {
    const docker = new Docker();

    const redisClient = await pipe(
      RedisClient({
        client: new Redis.Redis(),
        host: opts.redis.host,
        port: 6379,
        lazyConnect: true,
      }),
      throwTE,
    );

    const ctx = {
      docker,
      logger,
      pg: getPGClient(dbNamePattern),
      redis: redisClient,
    };

    const trunc = dbTruncator(dbNamePattern, opts.truncateTables);

    return {
      lookup: () => pipe(lookupDBContainer(opts.dbContainerName)(ctx), throwTE),
      listDatabases: () => pipe(listDatabases(dbNamePattern)(ctx), throwTE),
      startDBTruncator: () => pipe(trunc(ctx), throwTE),
      addDatabases: (dbCount) =>
        pipe(
          resetKeys(dbNamePattern),
          fp.RTE.chain(() => addDatabases(dbNamePattern)(dbCount)),
          fp.RTE.chainFirst(() => addKeys(dbNamePattern, dbCount)),
          (rte) => rte(ctx),
          throwTE,
        ),
      waitForDatabase: () => pipe(waitForDatabase(dbNamePattern)(ctx), throwTE),
      releaseDatabaseAndClose: (dbName) =>
        pipe(
          releaseDatabaseAndClose(dbName, opts.truncateTables)(ctx),
          throwTE,
        ),
      getRunStats: () =>
        pipe(
          liftP(() => ctx.redis.get(RUN_STATS_KEY)),
          fp.TE.map((stats) => (stats ? JSON.parse(stats) : null)),
          throwTE,
        ),
      freeDatabases: () => pipe(freeDatabases(dbNamePattern)(ctx), throwTE),
      close: () =>
        pipe(
          trunc(ctx),
          fp.TE.chain((timer) => fp.TE.fromIO(() => clearInterval(timer))),
          fp.TE.chain(() => close(ctx)),
          throwTE,
        ),
    };
  };
};
