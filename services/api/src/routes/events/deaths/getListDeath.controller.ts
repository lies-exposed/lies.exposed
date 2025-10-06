import { DeathIO } from "@liexp/backend/lib/io/event/death.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { DEATH } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "effect/Option";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetListDeathEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.List,
    ({
      query: {
        victim,
        draft,
        minDate: _minDate,
        maxDate: _maxDate,
        keywords,
        media,
        links,
        withDeleted,
        withDrafts,
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
      ctx.logger.debug.log("Victim is %O", victim);
      const ormOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query({
          ...query,
          draft,
          type: O.some([DEATH.literals[0]]),
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
        })(ctx),
        TE.chainEitherK(({ results, totals: { deaths } }) =>
          pipe(
            results,
            DeathIO.decodeMany,
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
