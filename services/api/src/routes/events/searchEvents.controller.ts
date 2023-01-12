import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { RouteContext } from "@routes/route.types";
import * as t from "io-ts";
import { getORMOptions } from "@utils/orm.utils";
import { toEventV2IO } from "./eventV2.io";
import { searchEventV2Query } from "./queries/searchEventsV2.query";

export const SearchEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.List, ({ query }) => {
    ctx.logger.debug.log("Query %O", query);
    const {
      actors,
      groups,
      groupsMembers,
      links,
      keywords,
      media,
      locations,
      draft,
      startDate,
      endDate,
      type: _type,
      title,
      exclude,
      withDeleted,
      withDrafts,
      emptyActors,
      emptyGroups,
      emptyKeywords,
      emptyLinks,
      emptyMedia,
      ids,
      ...queryRest
    } = query;

    ctx.logger.debug.log("query %O", queryRest);

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

    const type = pipe(
      _type,
      O.map((tp) => {
        return t.array(t.string).is(tp) ? tp : [tp];
      })
    );

    ctx.logger.debug.log("find options %O", findOptions);

    return pipe(
      searchEventV2Query(ctx)({
        actors,
        groups,
        groupsMembers,
        keywords,
        links,
        locations,
        type,
        title,
        startDate,
        endDate,
        media,
        exclude,
        draft,
        ids,
        withDeleted: O.getOrElse(() => false)(withDeleted),
        withDrafts: O.getOrElse(() => false)(withDrafts),
        emptyMedia,
        emptyLinks,
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
            totals.documentaries +
            totals.transactions,
          totals,
        },
        statusCode: 200,
      }))
    );
  });
};
