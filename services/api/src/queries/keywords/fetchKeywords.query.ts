import { type http } from "@liexp/shared/io";
import { type DBError } from "@liexp/shared/providers/orm";
import * as O from "fp-ts/Option";
import type * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { KeywordEntity } from "@entities/Keyword.entity";
import { type RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

// import * as O from 'fp-ts/Option'

const defaultQuery: http.Keyword.GetKeywordListQuery = {
  ids: O.none,
  search: O.none,
  events: O.none,
  _end: O.some(20 as any),
  _start: O.some(0 as any),
  _order: O.some("DESC"),
  _sort: O.some("createdAt"),
};
export const fetchKeywords =
  ({ db, env, logger }: RouteContext) =>
  (
    query: Partial<http.Keyword.GetKeywordListQuery>
  ): TE.TaskEither<DBError, [KeywordEntity[], number]> => {
    const q = { ...defaultQuery, ...query };

    const { ids, search, events, ...otherQuery } = q;

    const findOptions = getORMOptions(otherQuery, env.DEFAULT_PAGE_SIZE);

    logger.debug.log(`Find Options %O`, findOptions);

    return pipe(
      db.manager.createQueryBuilder(KeywordEntity, "keyword"),
      (q) => {
        if (O.isSome(ids)) {
          return q.where(`keyword.id IN (:...ids)`, {
            ids: ids.value,
          });
        }
        if (O.isSome(search)) {
          return q.where("keyword.tag LIKE :search", {
            search: `%${search.value}%`,
          });
        }
        // if (O.isSome(events)) {
        //   return q.where("eventsV2.id IN (:...events)", {
        //     events: events.value,
        //   });
        // }
        return q;
      },
      (q) => {
        return q
          .skip(findOptions.skip)
          .take(findOptions.take)
          .orderBy("keyword.updatedAt", "DESC");
      },
      (q) => {
        return db.execQuery(() => q.getManyAndCount());
      }
    );
  };
