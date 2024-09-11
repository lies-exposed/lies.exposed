import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { DEATH } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2IO } from "../eventV2.io.js";
import { searchEventV2Query } from "../queries/searchEventsV2.query.js";
import { type Route } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeGetListDeathEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.List,
    ({
      query: {
        victim,
        draft,
        minDate,
        maxDate,
        keywords,
        media,
        links,
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
      ctx.logger.debug.log("Victim is %O", victim);
      const ormOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query(ctx)({
          ...query,
          draft,
          type: O.some([DEATH.value]),
          actors: victim,
          keywords,
          links,
          media,
          withDeleted: O.getOrElse(() => false)(withDeleted),
          withDrafts: O.getOrElse(() => false)(withDrafts),
          emptyLinks,
          emptyMedia,
          spCount,
          onlyUnshared,
          ...ormOptions,
        }),
        TE.chainEitherK(({ results, totals: { deaths } }) =>
          pipe(
            results,
            EventV2IO.decodeMany,
            E.map((data) => ({ data, total: deaths })),
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
