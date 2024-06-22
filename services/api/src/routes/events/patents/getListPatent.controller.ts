import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { toEventV2IO } from "../eventV2.io.js";
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
        TE.chain(({ results, totals: { patents } }) =>
          pipe(
            results,
            A.traverse(E.Applicative)(toEventV2IO),
            TE.fromEither,
            TE.map((data) => ({ data, total: patents })),
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
