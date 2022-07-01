// import { EOL } from "os";
import { escapePostgresIdentifier } from "@databases/escape-identifier";
import { FormatConfig, SQLQuery } from "@databases/sql";
import * as logger from "@liexp/core/logger";
import * as O from "fp-ts/lib/Option";
import * as Reader from "fp-ts/lib/Reader";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { IOError } from 'ts-io-error';
import {
  Connection,
  ConnectionManager,
  
  DataSource,
  
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  getConnectionManager,
  ObjectID,
  SaveOptions,
  UpdateResult,
} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class DBError extends IOError {}

type Criteria =
  | string
  | string[]
  | number
  | number[]
  | Date
  | Date[]
  | ObjectID
  | ObjectID[];

interface DatabaseClient {
  manager: EntityManager;
  formatQuery: (sql: SQLQuery) => { text: string; values: any };
  execSQL: <T>(sql: SQLQuery) => TE.TaskEither<DBError, T>;
  execQuery: <T>(q: () => Promise<T>) => TE.TaskEither<DBError, T>;
  findOne: <Entity>(
    entityClass: EntityTarget<Entity>,
    options: FindOneOptions<Entity>
  ) => TE.TaskEither<DBError, O.Option<Entity>>;
  findOneOrFail: <Entity>(
    entityClass: EntityTarget<Entity>,
    options: FindOneOptions<Entity>
  ) => TE.TaskEither<DBError, Entity>;
  find: <Entity>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>
  ) => TE.TaskEither<DBError, Entity[]>;
  findAndCount: <Entity>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>
  ) => TE.TaskEither<DBError, [Entity[], number]>;
  count: <Entity>(
    entityClass: EntityTarget<Entity>,
    options?: FindOneOptions<Entity>
  ) => TE.TaskEither<DBError, number>;
  save: <Entity, T extends DeepPartial<Entity>>(
    entityClass: EntityTarget<Entity>,
    data: T[],
    opts?: SaveOptions
  ) => TE.TaskEither<DBError, Entity[]>;
  update: <Entity>(
    target: EntityTarget<Entity>,
    criteria: Criteria,
    partialEntity: QueryDeepPartialEntity<Entity>
  ) => TE.TaskEither<DBError, UpdateResult>;
  delete: <Entity>(
    target: EntityTarget<Entity>,
    criteria: Criteria
  ) => TE.TaskEither<DBError, DeleteResult>;
  softDelete: <Entity>(
    target: EntityTarget<Entity>,
    criteria: Criteria
  ) => TE.TaskEither<DBError, DeleteResult>;
  transaction: <T>(
    te: (em: DatabaseClient) => TE.TaskEither<DBError, T>
  ) => TE.TaskEither<DBError, T>;
  close: () => TE.TaskEither<DBError, void>;
}

interface GetDatabaseClientCtx {
  connection: Connection;
  logger: logger.Logger;
}

type GetDatabaseClient = (ctx: GetDatabaseClientCtx) => DatabaseClient;

export const toError =
  (l: logger.Logger) =>
  (override?: Partial<DBError>) =>
  (e: unknown): DBError => {
    l.error.log("An error occured %O", e);
    if (e instanceof Error) {
      return {
        status: override?.status ?? 500,
        name: "DBError",
        message: e.message,
        details: {
          kind: "ClientError",
          status: "500",
          meta: [e.stack],
        },
      };
    }

    return {
      status: override?.status ?? 500,
      name: "DBError",
      message: "An error occured",
      details: {
        kind: "ClientError",
        status: "500",
        meta: [String(e)],
      },
    };
  };

const pgFormat: FormatConfig = {
  escapeIdentifier: (str) => escapePostgresIdentifier(str),
  formatValue: (value, index) => ({ placeholder: `$${index + 1}`, value }),
};

const GetDatabaseClient: GetDatabaseClient = (ctx) => {
  const formatQuery = (sql: SQLQuery): { text: string; values: any } => {
    const format = sql.format(pgFormat);
    ctx.logger.debug.log(
      `SQL Formatted %s with params %O`,
      format.text,
      format.values
    );
    return format;
  };

  const execQuery = <T>(lazyQ: () => Promise<T>): TE.TaskEither<DBError, T> =>
    TE.tryCatch(lazyQ, toError(ctx.logger)());

  const handleError = toError(ctx.logger)

  return {
    manager: ctx.connection.manager,
    formatQuery,
    execQuery,
    execSQL: (sql) => {
      const query = formatQuery(sql);
      return execQuery(() =>
        ctx.connection.manager.query(query.text, query.values)
      );
    },
    findOne: (entity, options) => {
      ctx.logger.debug.log(`findOne %s with options %O`, entity, options);
      return pipe(
        TE.tryCatch(
          () => ctx.connection.manager.findOne(entity, options),
          handleError()
        ),
        TE.map(O.fromNullable)
      );
    },
    findOneOrFail: (entity, options) => {
      ctx.logger.debug.log(
        `findOneOrFail %s with options %O`,
        entity.valueOf().constructor.name,
        options
      );
      return TE.tryCatch(
        () => ctx.connection.manager.findOneOrFail(entity, options),
        handleError({ status: 404 })
      );
    },
    find: (entity, options) => {
      ctx.logger.debug.log(`find %s with options %O`, entity, options);
      return TE.tryCatch(
        () => ctx.connection.manager.find(entity, options),
        handleError()
      );
    },
    findAndCount: (entity, options) => {
      ctx.logger.debug.log(
        `find and count %s with options %O`,
        entity,
        options
      );
      return TE.tryCatch(
        () => ctx.connection.manager.findAndCount(entity, options),
        handleError()
      );
    },
    count: (entity, options) => {
      ctx.logger.debug.log(`count %s with options %O`, entity, options);
      return TE.tryCatch(
        () => ctx.connection.manager.count(entity, options),
        handleError()
      );
    },
    save: <E, T extends DeepPartial<E>>(
      entity: EntityTarget<E>,
      data: T[],
      options?: SaveOptions
    ) => {
      // ctx.logger.debug.log(
      //   `save entity %s with data %O with data %O options %O`,
      //   entity,
      //   data,
      //   options
      // );
      return TE.tryCatch(
        () =>
          ctx.connection.manager.save(entity, data, options) as any as Promise<
            E[]
          >,
        handleError()
      );
    },
    update: (entity, criteria, data) => {
      ctx.logger.debug.log(
        `update entity %s by criteria %O with data %O`,
        entity.valueOf().constructor.name,
        criteria,
        data
      );
      return TE.tryCatch(
        () => ctx.connection.manager.update(entity, criteria, data),
        handleError()
      );
    },
    delete: (entity, criteria) => {
      ctx.logger.debug.log(
        `delete entity %s by criteria %O`,
        entity.valueOf().constructor.name,
        criteria
      );
      return TE.tryCatch(
        () => ctx.connection.manager.delete(entity, criteria),
        handleError()
      );
    },
    softDelete: (entity, criteria) => {
      ctx.logger.debug.log(
        `delete (soft) entity %s by criteria %O`,
        entity.valueOf().constructor.name,
        criteria
      );
      return TE.tryCatch(
        () => ctx.connection.manager.softDelete(entity, criteria),
        handleError()
      );
    },
    transaction: <T>(
      task: (db: DatabaseClient) => TE.TaskEither<DBError, T>
    ) => {
      return pipe(
        TE.tryCatch(
          () =>
            ctx.connection.manager.transaction((e) => {
              const transactionClient = GetDatabaseClient({
                connection: e.connection,
                logger: ctx.logger,
              });
              return task(transactionClient)();
            }),
          handleError()
        ),
        TE.chain(TE.fromEither)
      );
    },
    close: () =>
      TE.tryCatch(() => ctx.connection.close(), handleError()),
  };
};

type DatabaseConnectionOpts =
  | PostgresConnectionOptions;

interface MakeDatabaseClientCtx {
  connectionName: string;
  connectionManager: ConnectionManager;
  logger: logger.Logger;
}

type MakeDatabaseClient = (
  ctx: MakeDatabaseClientCtx
) => (ctx: DataSource) => TE.TaskEither<DBError, DatabaseClient>;

const MakeDatabaseClient: MakeDatabaseClient =
  ({ connectionManager: cm, connectionName, logger }) =>
  (ctx) => {
    const getConnection = (
      cm: ConnectionManager,
      dataSource: DataSource
    ): TE.TaskEither<DBError, DataSource> => {
      logger.debug.log("Getting connection %s", connectionName);
      if (cm.has(connectionName)) {
        logger.debug.log(
          "The connection is already present in connection manager..."
        );
        const conn = cm.get(connectionName);

        return TE.tryCatch(
          () => (conn.isInitialized ? Promise.resolve(conn) : conn.initialize()),
          toError(logger)()
        );
      }

      logger.debug.log("Connection %s not found, creating...", connectionName);

      return TE.tryCatch(() => dataSource.initialize(), toError(logger)());
    };

    return pipe(
      getConnection(cm, ctx),
      TE.map((connection) => {
        return GetDatabaseClient({ connection, logger });
      })
    );
  };

const GetTypeORMClient: Reader.Reader<
  DataSource,
  TE.TaskEither<DBError, DatabaseClient>
> = MakeDatabaseClient({
  connectionManager: getConnectionManager(),
  connectionName: "default",
  logger: logger.GetLogger("typeorm"),
});

export {
  DatabaseClient,
  GetDatabaseClientCtx,
  GetDatabaseClient,
  DatabaseConnectionOpts,
  MakeDatabaseClientCtx,
  MakeDatabaseClient,
  GetTypeORMClient,
};
