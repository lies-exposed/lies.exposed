import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { searchEventV2Query } from "../queries/searchEventsV2.query.js";
import { EventV2IO } from "#routes/events/eventV2.io.js";
import { type Route } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeListScientificStudyRoute: Route = (
  r,
  { db, logger, env, ...ctx },
) => {
  AddEndpoint(r)(
    Endpoints.ScientificStudy.List,
    ({
      query: {
        publishedDate,
        provider,
        q,
        draft,
        ids,
        emptyLinks,
        emptyMedia,
        emptyActors,
        emptyGroups,
        emptyKeywords,
        withDeleted,
        withDrafts,
        spCount,
        onlyUnshared,
        ...query
      },
    }) => {
      const queryOptions = getORMOptions({ ...query }, env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query({ db, logger, env, ...ctx })({
          ids,
          type: O.some([SCIENTIFIC_STUDY.value]),
          groups: pipe(
            provider,
            O.map((p) => [p]),
          ),
          actors: O.none,
          groupsMembers: O.none,
          keywords: O.none,
          links: O.none,
          media: O.none,
          exclude: O.none,
          locations: O.none,
          q,
          draft,
          startDate: publishedDate,
          endDate: publishedDate,
          emptyLinks,
          emptyMedia,
          withDeleted: O.getOrElse(() => false)(withDeleted),
          withDrafts: O.getOrElse(() => false)(withDeleted),
          spCount,
          onlyUnshared,
          ...queryOptions,
        }),
        TE.chain(({ results, totals: { scientificStudies } }) =>
          pipe(
            results,
            EventV2IO.decodeMany,
            TE.fromEither,
            TE.map((data) => ({ data, total: scientificStudies })),
          ),
        ),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
