import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { type Router } from "express";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts";
import { toEventV2IO } from "./eventV2.io.js";
import { searchEventV2Query } from "./queries/searchEventsV2.query.js";
import { type RouteContext } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

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
      eventType: _type,
      q,
      exclude,
      withDeleted,
      withDrafts,
      emptyActors,
      emptyGroups,
      emptyKeywords,
      emptyLinks,
      emptyMedia,
      ids,
      spCount,
      onlyUnshared,
      ...queryRest
    } = query;

    // ctx.logger.debug.log("query %O", queryRest);

    const findOptions = getORMOptions(
      {
        ...queryRest,
        _sort: pipe(
          queryRest._sort,
          O.alt(() => O.some("date")),
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE,
    );

    const type = pipe(
      _type,
      O.map((tp) => (t.array(EventType).is(tp) ? tp : [tp])),
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
        q,
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
        spCount,
        onlyUnshared,
        ...findOptions,
      }),
      TE.chain(({ results, ...rest }) =>
        pipe(
          results,
          A.map((e) => toEventV2IO(e)),
          A.sequence(E.Applicative),
          E.map((data) => ({ data, ...rest })),
          TE.fromEither,
        ),
      ),
      TE.map(({ data, totals, firstDate, lastDate }) => ({
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
          firstDate: firstDate?.toISOString(),
          lastDate: lastDate?.toISOString(),
        },
        statusCode: 200,
      })),
    );
  });
};
