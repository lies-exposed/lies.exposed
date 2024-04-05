import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeKeywordsDistributionRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r)(
    Endpoints.Keyword.Custom.Distribution,
    ({ query: { ids, events, q: search, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE,
      );

      ctx.logger.debug.log(`Find Options %O`, { ...findOptions, events });

      const findTask = pipe(
        ctx.db.manager
          .createQueryBuilder(KeywordEntity, "keyword")
          // .leftJoinAndSelect("keyword.events", "events")
          .loadAllRelationIds({ relations: ["events"] }),
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
          return q.skip(findOptions.skip).take(findOptions.take);
          // .orderBy("count("keyword"."events")", "DESC");
        },
        (q) => {
          return ctx.db.execQuery(() => q.getManyAndCount());
        },
      );

      return pipe(
        findTask,
        // ctx.logger.info.logInTaskEither(`find results %O`),
        TE.chain(([data, total]) =>
          pipe(
            TE.right<ControllerError, any>(
              data.map((d) => ({
                ...d,
                color: d.color ?? "000000",
                events: d.events.length,
              })),
            ),
            // A.traverse(E.either)(toKeywordIO),
            // TE.fromEither,
            TE.map((results) => ({
              total,
              data: results,
            })),
          ),
        ),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
