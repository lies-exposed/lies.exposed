import { type Query } from "@liexp/shared/lib/io/http/index.js";
import { type Reader } from "fp-ts/lib/Reader.js";
import { pipe } from "fp-ts/lib/function.js";
import { type EntityManager } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";
import { type RouteContext } from "#routes/route.types.js";
import { getORMOptions, type ORMOptions } from "#utils/orm.utils.js";

const execQuery =
  <A>(fn: (db: EntityManager) => Promise<A>): TEReader<A> =>
  (ctx) => {
    return pipe(ctx.db.execQuery(fn));
  };

export const DBService = {
  execQuery,
  getORMOptions:
    (
      opts: Omit<Query.GetListQuery, "q"> & Query.FilterQuery,
      pageSize?: number,
    ): Reader<RouteContext, ORMOptions> =>
    (ctx) => {
      return getORMOptions(opts, pageSize ?? ctx.env.DEFAULT_PAGE_SIZE);
    },
};
