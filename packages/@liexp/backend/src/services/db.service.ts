import { type Query } from "@liexp/shared/lib/io/http/index.js";
import { type Reader } from "fp-ts/lib/Reader.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type EntityManager } from "typeorm";
import { type DatabaseContext } from "../context/db.context.js";
import { type ENVContext } from "../context/env.context.js";
import { type DBError } from "../providers/orm/database.provider.js";
import { getORMOptions, type ORMOptions } from "../utils/orm.utils.js";

const execQuery =
  <A, C extends DatabaseContext>(
    fn: (db: EntityManager) => Promise<A>,
  ): ReaderTaskEither<C, DBError, A> =>
  (ctx) => {
    return pipe(ctx.db.execQuery(fn));
  };

export const DBService = {
  execQuery,
  getORMOptions:
    <R extends ENVContext>(
      opts: Omit<Query.GetListQuery, "q"> & Query.FilterQuery,
      pageSize?: number,
    ): Reader<R, ORMOptions> =>
    (ctx) => {
      return getORMOptions(opts, pageSize ?? ctx.env.DEFAULT_PAGE_SIZE);
    },
};
