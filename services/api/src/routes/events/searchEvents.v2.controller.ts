import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { EventV2 } from "@econnessione/shared/io/http/Events";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { searchEventV2Query } from "./queries/searchEventsV2.query";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/listQueryToORMOptions";

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

    return pipe(
      searchEventV2Query(ctx)({
        actors,
        groups,
        groupsMembers,
        keywords,
        ...findOptions,
      }),
      TE.chain(({ results, totals }) =>
        pipe(
          results,
          A.map((e) =>
            E.right<any, EventV2>({
              ...(e as any),
              keywords: e.keywords.map((k) => k.id) as any[],
              media: e.media.map((m) => m.id) as any[],
            })
          ),
          A.sequence(E.Applicative),
          E.map((data) => ({ data, totals })),
          TE.fromEither
        )
      ),
      TE.map(({ data, totals }) => ({
        body: {
          data,
          totals,
        },
        statusCode: 200,
      }))
    );
  });
};
