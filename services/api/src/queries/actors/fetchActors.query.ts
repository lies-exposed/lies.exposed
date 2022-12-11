import { http } from "@liexp/shared/io";
import { DBError } from "@liexp/shared/providers/orm";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import { ActorEntity } from "@entities/Actor.entity";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

// import * as O from 'fp-ts/Option'

const defaultQuery: http.Actor.GetListActorQuery = {
  ids: O.none,
  fullName: O.none,
  _end: O.some(20 as any),
  _start: O.some(0 as any),
  _order: O.some("DESC"),
  _sort: O.some("createdAt"),
};
export const fetchActors =
  ({ db, env, logger }: RouteContext) =>
  (
    query: Partial<http.Actor.GetListActorQuery>
  ): TE.TaskEither<DBError, { total: number; results: ActorEntity[] }> => {
    const q = { ...defaultQuery, ...query };

    const { ids, fullName, ...otherQuery } = q;

    const findOptions = getORMOptions(otherQuery, env.DEFAULT_PAGE_SIZE);

    logger.debug.log(`Find Options %O`, findOptions);

    return pipe(
      db.manager
        .createQueryBuilder(ActorEntity, "actors")
        .loadAllRelationIds({ relations: ["memberIn"] }),
      (q) => {
        if (O.isSome(ids)) {
          return q.andWhere("actors.id IN (:...ids)", {
            ids: ids.value,
          });
        }
        if (O.isSome(fullName)) {
          return q.andWhere("lower(actors.fullName) LIKE :fullName", {
            fullName: `%${fullName.value}%`,
          });
        }
        return q;
      },
      (q) => {
        if (findOptions.order) {
          const order = pipe(
            findOptions.order,
            R.reduceWithIndex(S.Ord)({}, (k, acc, v) => ({
              ...acc,
              [`actors.${k}`]: v,
            }))
          );
          return q.orderBy(order);
        }
        return q;
      },
      (q) => {
        return q.skip(findOptions.skip).take(findOptions.take);
      },
      (q) => db.execQuery(() => q.getManyAndCount()),
      TE.map(([results, total]) => ({ total, results }))
    );
  };
