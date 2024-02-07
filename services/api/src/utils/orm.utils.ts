import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as Query from "@liexp/shared/lib/io/http/Query/index.js";
import * as O from "fp-ts/lib/Option.js";
import { contramap } from "fp-ts/lib/Ord.js";
import * as R from "fp-ts/lib/Record.js";
import * as t from "io-ts";
import { BigIntFromString } from "io-ts-types/lib/BigIntFromString.js";
import {
  Equal,
  type FindOperator,
  In,
  Like,
  type SelectQueryBuilder,
  type ObjectLiteral,
} from "typeorm";

export interface ORMOrder {
  order: Record<"random" | string, "ASC" | "DESC">;
}

interface ORMPagination {
  skip: number;
  take: number;
}

interface ORMFilter {
  where: Record<string, FindOperator<any>>;
}

const getOrderQuery = (s: Query.SortQuery): Partial<ORMOrder> => {
  return pipe(
    s._sort,
    O.fold(
      () => ({}),
      (key) => {
        if (key === "random") {
          return {
            order: { random: true },
          };
        }
        return {
          order: {
            [key]: O.getOrElse(
              (): Query.SortOrder => Query.SortOrderDESC.value,
            )(s._order),
          },
        };
      },
    ),
  );
};

const getSkipAndTakeOptions = (
  pagination: Query.PaginationQuery,
  defaultPageSize: number,
): ORMPagination => {
  const take = pipe(
    pagination._end,
    O.filter((n) => n > 0), // end is exclusive
    O.getOrElse(() => defaultPageSize),
  );
  return pipe(
    pagination._start,
    O.alt(() => O.some(0)),
    O.map((p) => ({ skip: p, take })),
    O.getOrElse(() => ({ skip: 0, take })),
  );
};

const getWhereOption = (_f: Query.FilterQuery): Partial<ORMFilter> => {
  return pipe(
    _f,
    R.filter(O.isSome),
    R.mapWithIndex((key, e) => {
      if (UUID.is(e.value)) {
        return Equal(e.value);
      }
      if (BigIntFromString.is(e.value)) {
        return Equal(e.value.toString());
      }
      if (t.array(t.string).is(e.value) || t.array(UUID).is(e.value)) {
        return In(e.value);
      }
      if (key === "path") {
        return Equal(e.value);
      }
      return Like(`%${e.value}%`);
    }),
    (filters) => {
      if (R.isEmpty(filters)) {
        return {};
      }
      return {
        where: filters,
      };
    },
  );
};

export const getOrder = (
  order: ORMOrder["order"],
  prefix?: string,
  orderedKeys?: string[],
): ORMOrder["order"] => {
  const init: Record<string, { value: any; index: number }> = {};
  return pipe(
    order,
    R.reduceWithIndex(fp.S.Ord)(init, (key, acc, value) => {
      const finalKey = prefix ? `${prefix}.${key}` : key;
      const keyIndex = (orderedKeys ?? []).findIndex((k) => k === finalKey);
      const index = keyIndex;
      acc[finalKey] = {
        value,
        index,
      };
      return acc;
    }),
    R.toArray,
    fp.A.sort(
      pipe(
        fp.N.Ord,
        contramap(([k, e]: [string, { value: any; index: number }]) => e.index),
        fp.Ord.reverse,
      ),
    ),
    fp.A.reduce({} as any, (acc, v) => {
      acc[v[0]] = v[1].value;
      return acc;
    }),
  );
};

export const addOrder = <T extends ObjectLiteral>(
  order: ORMOrder["order"],
  q: SelectQueryBuilder<T>,
  prefix?: string,
  orderedKeys?: string[],
): SelectQueryBuilder<T> => {
  return pipe(
    getOrder(order, prefix, orderedKeys),
    R.mapWithIndex((key, value) => {
      if (key.includes("random")) {
        q.addOrderBy("seeder_random", "DESC");
      } else {
        q.addOrderBy(key, value);
      }
    }),
    () => q,
  );
};

export type ORMOptions = Partial<ORMOrder> & ORMPagination & Partial<ORMFilter>;

export const getORMOptions = (
  {
    _start,
    _end,
    _sort,
    _order,
    ...filter
  }: Omit<Query.GetListQuery, "search"> & Query.FilterQuery,
  defaultPageSize: number,
): ORMOptions => ({
  ...getSkipAndTakeOptions({ _start, _end }, defaultPageSize),
  ...getOrderQuery({ _sort, _order }),
  ...getWhereOption(filter),
});
