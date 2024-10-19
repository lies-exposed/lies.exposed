import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as R from "fp-ts/lib/Record.js";
import * as S from "fp-ts/lib/string.js";
import { type Int } from "io-ts";
import { type ServerContext } from "#context/context.type.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { DBService } from "#services/db.service.js";

// import * as O from 'fp-ts/lib/Option.js'

const defaultQuery: http.Actor.GetListActorQuery = {
  ids: O.none,
  q: O.none,
  _end: O.some(20 as Int),
  _start: O.some(0 as Int),
  _order: O.some("DESC"),
  _sort: O.some("createdAt"),
};
export const fetchActors = (
  query: Partial<http.Actor.GetListActorQuery>,
): TEReader<{ total: number; results: ActorEntity[] }> => {
  const finalQuery = { ...defaultQuery, ...query };

  const { ids, q: search, ...otherQuery } = finalQuery;

  return pipe(
    DBService.getORMOptions<ServerContext>({ ...otherQuery }),
    fp.RTE.fromReader,
    fp.RTE.chain((findOptions) =>
      DBService.execQuery((em) =>
        pipe(
          em
            .createQueryBuilder(ActorEntity, "actors")
            .leftJoinAndSelect("actors.avatar", "avatar")
            .loadAllRelationIds({ relations: ["memberIn"] }),
          (q) => {
            if (O.isSome(ids)) {
              return q.andWhere("actors.id IN (:...ids)", {
                ids: ids.value,
              });
            }
            if (O.isSome(search)) {
              return q.andWhere(
                "lower(unaccent(actors.fullName)) LIKE :fullName",
                {
                  fullName: `%${search.value}%`,
                },
              );
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
                })),
              );
              return q.orderBy(order);
            }
            return q;
          },
          (q) => {
            return q
              .skip(findOptions.skip)
              .take(findOptions.take)
              .getManyAndCount();
          },
        ),
      ),
    ),
    fp.RTE.map(([results, total]) => ({ total, results })),
  );
};
