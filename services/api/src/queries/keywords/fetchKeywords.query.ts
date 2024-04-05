import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import * as O from "fp-ts/lib/Option.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import {
  aggregateSocialPostsPerEntry,
  leftJoinSocialPosts,
} from "#queries/socialPosts/leftJoinSocialPosts.query.js";
import { getORMOptions } from "#utils/orm.utils.js";

const defaultQuery: http.Keyword.GetKeywordListQuery = {
  ids: O.none,
  q: O.none,
  events: O.none,
  _end: O.some(20 as any),
  _start: O.some(0 as any),
  _order: O.some("DESC"),
  _sort: O.some("createdAt"),
};

export const fetchKeywords: TEFlow<
  [Partial<http.Keyword.GetKeywordListQuery>, boolean],
  [KeywordEntity[], number]
> =
  ({ db, env, logger }) =>
  (query, isAdmin): TE.TaskEither<DBError, [KeywordEntity[], number]> => {
    const q = { ...defaultQuery, ...query };

    const { ids, q: search, events, ...otherQuery } = q;

    const findOptions = getORMOptions(otherQuery, env.DEFAULT_PAGE_SIZE);

    logger.debug.log(`Find Options %O`, findOptions);

    return pipe(
      db.manager.createQueryBuilder(KeywordEntity, "keyword"),
      (q) => {
        if (isAdmin) {
          q.leftJoinAndSelect(
            leftJoinSocialPosts("keywords"),
            "socialPosts",
            'keyword.id = "socialPosts"."socialPosts_entity"',
          );
        }
        return q;
      },
      (q) => {
        if (O.isSome(ids)) {
          return q.where(`keyword.id IN (:...ids)`, {
            ids: ids.value,
          });
        }
        if (O.isSome(search)) {
          return q.where("lower(keyword.tag) LIKE lower(:search)", {
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
        return db.execQuery(async () => {
          if (isAdmin) {
            const results = await q.getRawAndEntities();
            const count = await q.getCount();
            const entities = results.entities.map((e) => ({
              ...e,
              socialPosts: aggregateSocialPostsPerEntry(
                "keyword_id",
                results.raw,
                e,
              ) as any[],
            }));
            return [entities, count];
          }
          return q.getManyAndCount();
        });
      },
    );
  };
