import { UUID } from "@econnessione/shared/io/http/Common/UUID";
import * as Query from "@econnessione/shared/io/http/Query";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { BigIntFromString } from "io-ts-types";
import { FindOperator, Like, Equal, In } from "typeorm";

interface ORMOrder {
  order: { [key: string]: "ASC" | "DESC" };
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
        return {
          order: {
            [key]: O.getOrElse(
              (): Query.SortOrder => Query.SortOrderDESC.value
            )(s._order),
          },
        };
      }
    )
  );
};

const getSkipAndTakeOptions = (
  pagination: Query.PaginationQuery,
  defaultPageSize: number
): ORMPagination => {
  const take = pipe(
    pagination._end,
    O.getOrElse(() => defaultPageSize)
  );
  return pipe(
    pagination._start,
    O.alt(() => O.some(0)),
    O.map((p) => {
      return { skip: p, take };
    }),
    O.getOrElse(() => ({ skip: 0, take }))
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
      if (t.array(t.string).is(e.value)) {
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
    }
  );
};

export const getORMOptions = (
  {
    _start,
    _end,
    _sort,
    _order,
    ...filter
  }: Query.GetListQuery & Query.FilterQuery,
  defaultPageSize: number
): Partial<ORMOrder> & ORMPagination & Partial<ORMFilter> => ({
  ...getSkipAndTakeOptions({ _start, _end }, defaultPageSize),
  ...getOrderQuery({ _sort, _order }),
  ...getWhereOption(filter),
});
