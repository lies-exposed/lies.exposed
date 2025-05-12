import { pipe } from "@liexp/core/lib/fp/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import { type Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { KeywordEntity } from "../../entities/Keyword.entity.js";
import { type DBError } from "../../providers/orm/index.js";
import { getORMOptions } from "../../utils/orm.utils.js";
import {
  aggregateSocialPostsPerEntry,
  leftJoinSocialPosts,
} from "../social-post/leftJoinSocialPosts.query.js";

const defaultQuery: http.Keyword.GetKeywordListQuery = {
  ids: O.none(),
  q: O.none(),
  events: O.none(),
  _end: O.some(20 as typeof Schema.Int.Type),
  _start: O.some(0 as typeof Schema.Int.Type),
  _order: O.some("DESC"),
  _sort: O.some("createdAt"),
};

export const fetchKeywords =
  <C extends DatabaseContext & LoggerContext & ENVContext>(
    query: Partial<http.Keyword.GetKeywordListQuery>,
    isAdmin: boolean,
  ): ReaderTaskEither<C, DBError, [KeywordEntity[], number]> =>
  ({ db, env, logger }) => {
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
              ),
            }));
            return [entities, count];
          }
          return q.getManyAndCount();
        });
      },
    );
  };
