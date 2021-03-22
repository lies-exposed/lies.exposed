// import { EOL } from "os";
import * as logger from "@econnessione/core/logger";
import { ControllerError } from "@io/ControllerError";
import * as O from "fp-ts/lib/Option";
import * as Reader from "fp-ts/lib/Reader";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  Connection,
  ConnectionManager,
  ConnectionOptions,
  DeepPartial,
  DeleteResult,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  getConnectionManager,
  ObjectID,
  SaveOptions,
  UpdateResult,
} from "typeorm";
import { AuroraDataApiPostgresConnectionOptions } from "typeorm/driver/aurora-data-api-pg/AuroraDataApiPostgresConnectionOptions";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
// import { Direction, Flags, Format, TypeormUml } from "typeorm-uml";

class DBError extends ControllerError {}

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
  findOne: <Entity>(
    entityClass: EntityTarget<Entity>,
    options?: FindOneOptions<Entity>
  ) => TE.TaskEither<DBError, O.Option<Entity>>;
  findOneOrFail: <Entity>(
    entityClass: EntityTarget<Entity>,
    options?: FindOneOptions<Entity>
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

export const toError = (l: logger.Logger) => (e: unknown): DBError => {
  l.error.log("An error occured %O", e);
  if (e instanceof Error) {
    return {
      status: 500,
      name: "DBError",
      message: e.message,
      details: {
        kind: "ClientError",
        meta: [e.stack],
      },
    };
  }
  return {
    status: 500,
    name: "DBError",
    message: "An error occured",
    details: {
      kind: "ClientError",
      meta: [String(e)],
    },
  };
};

const GetDatabaseClient: GetDatabaseClient = (ctx) => {
  return {
    findOne: (entity, options) => {
      ctx.logger.debug.log(`findOne %s with options %O`, entity, options);
      return pipe(
        TE.tryCatch(
          () => ctx.connection.manager.findOne(entity, options),
          toError(ctx.logger)
        ),
        TE.map(O.fromNullable)
      );
    },
    findOneOrFail: (entity, options) => {
      ctx.logger.debug.log(
        `findOne %s with options %O`,
        entity.valueOf().constructor.name,
        options
      );
      return TE.tryCatch(
        () => ctx.connection.manager.findOneOrFail(entity, options),
        toError(ctx.logger)
      );
    },
    find: (entity, options) => {
      ctx.logger.debug.log(`find %s with options %O`, entity, options);
      return TE.tryCatch(
        () => ctx.connection.manager.find(entity, options),
        toError(ctx.logger)
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
        toError(ctx.logger)
      );
    },
    count: (entity, options) => {
      ctx.logger.debug.log(`count %s with options %O`, entity, options);
      return TE.tryCatch(
        () => ctx.connection.manager.count(entity, options),
        toError(ctx.logger)
      );
    },
    save: <E, T extends DeepPartial<E>>(
      entity: EntityTarget<E>,
      data: T[],
      options?: SaveOptions
    ) => {
      ctx.logger.debug.log(
        `save entity %s with data %O with data %O options %O`,
        entity,
        data,
        options
      );
      return TE.tryCatch(
        () =>
          (ctx.connection.manager.save(
            entity,
            data,
            options
          ) as any) as Promise<E[]>,
        toError(ctx.logger)
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
        toError(ctx.logger)
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
        toError(ctx.logger)
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
          toError(ctx.logger)
        ),
        TE.chain(TE.fromEither)
      );
    },
    close: () => TE.tryCatch(() => ctx.connection.close(), toError(ctx.logger)),
  };
};

type DatabaseConnectionOpts =
  | PostgresConnectionOptions
  | AuroraDataApiPostgresConnectionOptions;

interface MakeDatabaseClientCtx {
  connectionName: string;
  connectionManager: ConnectionManager;
  logger: logger.Logger;
}

type MakeDatabaseClient = (
  ctx: MakeDatabaseClientCtx
) => (ctx: DatabaseConnectionOpts) => TE.TaskEither<DBError, DatabaseClient>;

const MakeDatabaseClient: MakeDatabaseClient = ({
  connectionManager: cm,
  connectionName,
  logger,
}) => (ctx) => {
  const getConnection = (
    cm: ConnectionManager,
    opts: ConnectionOptions
  ): TE.TaskEither<DBError, Connection> => {
    logger.debug.log("Getting connection %s", connectionName);
    if (cm.has(connectionName)) {
      logger.debug.log(
        "The connection is already present in connection manager..."
      );
      return TE.tryCatch(
        () => cm.get(connectionName).connect(),
        toError(logger)
      );
    }

    logger.debug.log("Connection %s not found, creating...", connectionName);
    logger.debug.log("Creating connection %O", opts);

    return TE.tryCatch(() => cm.create(opts).connect(), toError(logger));
  };

  return pipe(
    getConnection(cm, ctx),
    TE.map((connection) => {
      // const flags: Flags = {
      //   direction: Direction.LR,
      //   format: Format.SVG,
      //   handwritten: false,
      // };

      // const typeormUml = new TypeormUml();
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      // typeormUml
      //   .build(connection, flags)
      //   .then((url) => process.stdout.write(`Diagram URL: ${url} ${EOL}`));

      return GetDatabaseClient({ connection, logger });
    })
  );
};

const GetTypeORMClient: Reader.Reader<
  DatabaseConnectionOpts,
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
