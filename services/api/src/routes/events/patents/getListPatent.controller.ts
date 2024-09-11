import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2IO } from "../eventV2.io.js";
import { searchEventV2Query } from "../queries/searchEventsV2.query.js";
import { type Route } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeGetListPatentEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.PatentEvent.List,
    ({
      query: {
        draft,
        minDate,
        maxDate,
        keywords,
        media,
        links,
        locations,
        withDeleted,
        withDrafts,
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
        searchEventV2Query(ctx)({
          ...query,
          type: O.some([EventTypes.PATENT.value]),
          draft,
          actors: O.none,
          keywords,
          links,
          media,
          locations,
          emptyLinks,
          emptyMedia,
          withDeleted: O.getOrElse(() => false)(withDeleted),
          withDrafts: O.getOrElse(() => false)(withDrafts),
          spCount,
          onlyUnshared,
          ...ormOptions,
        }),
        TE.chainEitherK(({ results, totals: { patents } }) =>
          pipe(
            results,
            EventV2IO.decodeMany,
            E.map((data) => ({ data, total: patents })),
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
