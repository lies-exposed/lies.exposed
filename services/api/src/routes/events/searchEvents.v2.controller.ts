import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";

export const MakeSearchV2EventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.Custom.SearchV2, ({ query }) => {
    ctx.logger.debug.log("Query %O", query);
    const {
      actors,
      groups,
      groupsMembers,
      links,
      keywords,
      media,
      startDate,
      endDate,
      ...queryRest
    } = query;
    const findOptions = getORMOptions(
      {
        ...queryRest,
        _sort: pipe(
          queryRest._sort,
          O.alt(() => O.some("startDate"))
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE
    );

    ctx.logger.debug.log(`Find options conditions: %O`, {
      actors,
      groups,
      groupsMembers,
      ...findOptions,
    });

    const sqlTask = pipe(
      ctx.db.manager
        .createQueryBuilder(EventV2Entity, "event")
        .leftJoinAndSelect("event.keywords", "keywords")
        .leftJoinAndSelect("event.media", "media"),
      (q) => {
        if (O.isSome(actors)) {
          return q.where([
            `event.payload.actors ::jsonb @> IN (:...${actors.value})`,
            `event.payload.victim ::jsonb @> IN (:...${actors.value})`,
          ]);
        }
        return q;
      },
      (q) => {
        if (O.isSome(keywords)) {
          return q.where({
            "keywords.id IN (:...keywords)": { keywords: keywords.value },
          });
        }

        return q;
      },
      (q) => {
        return q
          .skip(findOptions.skip)
          .take(findOptions.take)
          .orderBy("event.date", "DESC");
      },

      (q) => ctx.db.execQuery(() => q.getManyAndCount())
    );

    return pipe(
      sqlTask,
      TE.chain(([events, count]) =>
        pipe(
          events,
          A.map((e) => E.right<any, any>(e)),
          A.sequence(E.Applicative),
          E.map((data) => ({ data, totals: count })),
          TE.fromEither
        )
      ),
      TE.map(({ data, totals }) => ({
        body: {
          data,
          totals: {
            deaths: 0,
            scientificStudies: 0,
            uncategorized: totals,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
