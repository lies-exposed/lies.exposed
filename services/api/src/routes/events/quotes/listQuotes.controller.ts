import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { searchEventV2Query } from "../queries/searchEventsV2.query.js";
import { QuoteIO } from "./quote.io.js";
import { type Route } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

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
        emptyActors,
        emptyGroups,
        emptyKeywords,
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
          type: O.some([EventTypes.QUOTE.value]),
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
