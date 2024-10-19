import { type DatabaseContext } from "@liexp/backend/lib/context/index.js";
import { type Query } from "@liexp/shared/lib/io/http/index.js";
import { type Reader } from "fp-ts/lib/Reader.js";
import { pipe } from "fp-ts/lib/function.js";
import { type EntityManager } from "typeorm";
import { type ENVContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";
import { getORMOptions, type ORMOptions } from "#utils/orm.utils.js";

const execQuery =
  <A, C extends DatabaseContext>(
    fn: (db: EntityManager) => Promise<A>,
  ): TEReader<A, C> =>
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
