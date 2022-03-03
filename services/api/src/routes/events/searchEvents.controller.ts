import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toEventV2IO } from "./eventV2.io";
import { searchEventV2Query } from "./queries/searchEventsV2.query";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

export const MakeSearchEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.List, ({ query }) => {
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
      type,
      title,
      withDeleted,
      withDrafts,
      ...queryRest
    } = query;

    const findOptions = getORMOptions(
      {
        ...queryRest,
        _sort: pipe(
          queryRest._sort,
          O.alt(() => O.some("date"))
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE
    );

    ctx.logger.debug.log("find options %O", findOptions);

    return pipe(
      searchEventV2Query(ctx)({
        actors,
        groups,
        groupsMembers,
        keywords,
        links,
        type,
        title,
        startDate,
        endDate,
        media,
        withDeleted: O.getOrElse(() => false)(withDeleted),
        withDrafts: O.getOrElse(() => false)(withDrafts),
        ...findOptions,
      }),
      TE.chain(({ results, totals }) =>
        pipe(
          results,
          A.map((e) => toEventV2IO(e)),
          A.sequence(E.Applicative),
          E.map((data) => ({ data, totals })),
          TE.fromEither
        )
      ),
      TE.map(({ data, totals }) => ({
        body: {
          data,
          total:
            totals.deaths +
            totals.scientificStudies +
            totals.uncategorized +
            totals.patents +
            totals.documentaries,
          totals,
        },
        statusCode: 200,
      }))
    );
  });
};
