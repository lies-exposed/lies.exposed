import { ScientificStudyIO } from "@liexp/backend/lib/io/event/scientific-study.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ServerContext } from "../../../context/context.type.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

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
        emptyActors: _emptyActors,
        emptyGroups: _emptyGroups,
        emptyKeywords: _emptyKeywords,
        withDeleted,
        withDrafts: _withDrafts,
        spCount,
        onlyUnshared,
        ...query
      },
    }) => {
      const queryOptions = getORMOptions({ ...query }, env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query<ServerContext>({
          ids,
          type: O.some([SCIENTIFIC_STUDY.literals[0]]),
          groups: pipe(
            provider,
            O.map((p) => [p]),
          ),
          actors: O.none(),
          groupsMembers: O.none(),
          keywords: O.none(),
          links: O.none(),
          media: O.none(),
          exclude: O.none(),
          locations: O.none(),
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
        })({ db, logger, env, ...ctx }),
        TE.chain(({ results, totals: { scientificStudies } }) =>
          pipe(
            results,
            ScientificStudyIO.decodeMany,
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
