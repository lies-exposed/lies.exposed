import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toKeywordIO } from "./keyword.io";
import { KeywordEntity } from "@entities/Keyword.entity";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

export const MakeListKeywordRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Keyword.List,
    ({ query: { ids, events, search, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      ctx.logger.debug.log(`Find Options %O`, { ...findOptions, events });

      const findTask = pipe(
        ctx.db.manager.createQueryBuilder(KeywordEntity, "keyword"),
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
          return ctx.db.execQuery(() => q.getManyAndCount());
        }
      );

      return pipe(
        findTask,
        TE.chain(([data, total]) =>
          pipe(
            data,
            A.traverse(E.either)(toKeywordIO),
            TE.fromEither,
            TE.map((results) => ({
              total,
              data: results,
            }))
          )
        ),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
