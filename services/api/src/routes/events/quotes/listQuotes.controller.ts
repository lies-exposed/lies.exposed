import { QuoteIO } from "@liexp/backend/lib/io/event/quote.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "effect/Option";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetListQuoteRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.QuoteEvent.List,
    ({
      query: {
        draft,
        startDate,
        endDate,
        keywords,
        media,
        links,
        withDeleted,
        withDrafts,
        groups,
        groupsMembers,
        actors,
        q,
        locations,
        exclude,
        ids,
        emptyActors: _emptyActors,
        emptyGroups: _emptyGroups,
        emptyKeywords: _emptyKeywords,
        emptyLinks,
        emptyMedia,
        spCount,
        onlyUnshared,
        ...query
      },
    }) => {
      const ormOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query({
          // ...query,
          ids,
          draft,
          locations,
          exclude,
          type: O.some([EVENT_TYPES.QUOTE]),
          startDate,
          endDate,
          actors,
          keywords,
          links,
          media,
          q,
          groups,
          groupsMembers,
          emptyLinks,
          emptyMedia,
          withDeleted: O.getOrElse(() => false)(withDeleted),
          withDrafts: O.getOrElse(() => false)(withDrafts),
          spCount,
          onlyUnshared,
          ...ormOptions,
        })(ctx),
        TE.chainEitherK(({ results, totals: { quotes } }) =>
          pipe(
            results,
            QuoteIO.decodeMany,
            E.map((data) => ({ data, total: quotes })),
          ),
        ),
        TE.map((body) => ({
          body,
          statusCode: 200,
        })),
      );
    },
  );
};
