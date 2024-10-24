import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts";
import { EventV2IO } from "./eventV2.io.js";
import { searchEventV2Query } from "./queries/searchEventsV2.query.js";
import { type Route } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const SearchEventRoute: Route = (r, ctx) => {
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
      searchEventV2Query({
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
      })(ctx),
      TE.chain(({ results, ...rest }) =>
        pipe(
          results,
          EventV2IO.decodeMany,
          E.map((data) => ({ data, ...rest })),
          TE.fromEither,
        ),
      ),
      TE.map(({ data, total, totals, firstDate, lastDate }) => ({
        body: {
          data,
          total,
          totals,
          firstDate: firstDate?.toISOString(),
          lastDate: lastDate?.toISOString(),
        },
        statusCode: 200,
      })),
    );
  });
};
