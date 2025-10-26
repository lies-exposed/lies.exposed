import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchEventsRelations } from "../../flows/events/fetchEventsRelations.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const SearchEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.SearchEvents, ({ query }) => {
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
      emptyActors: _emptyActors,
      emptyGroups: _emptyGroups,
      emptyKeywords: _emptyKeywords,
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
          O.orElse(() => O.some("date")),
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE,
    );

    const type = pipe(
      _type,
      O.map((tp) => (Schema.is(Schema.Array(EventType))(tp) ? tp : [])),
    );

    ctx.logger.debug.log("find options %O", findOptions);

    return pipe(
      TE.Do,
      TE.bind("events", () =>
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
      ),
      TE.bind("searchEvents", ({ events: { results: events } }) =>
        pipe(
          EventV2IO.decodeMany(events),
          TE.fromEither,
          TE.chain((events) => fetchEventsRelations(events, false)(ctx)),
          TE.map(({ events, ...relations }) =>
            pipe(
              events,
              fp.A.map((e) => toSearchEvent(e, relations)),
              (events) => ({ events, ...relations }),
            ),
          ),
        ),
      ),
      TE.map(
        ({ searchEvents, events: { firstDate, lastDate, total, totals } }) => ({
          body: {
            data: {
              ...searchEvents,
              total,
              totals,
              firstDate: firstDate?.toISOString(),
              lastDate: lastDate?.toISOString(),
            },
            total,
            totals,
            firstDate: firstDate?.toISOString(),
            lastDate: lastDate?.toISOString(),
          },
          statusCode: 200,
        }),
      ),
    );
  });
};
