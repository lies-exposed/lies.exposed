import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/ScientificStudy";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { searchEventV2Query } from "../queries/searchEventsV2.query";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { type Route } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

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
        title,
        draft,
        ids,
        emptyLinks,
        emptyMedia,
        emptyActors,
        emptyGroups,
        emptyKeywords,
        withDeleted,
        withDrafts,
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
          title,
          draft,
          startDate: publishedDate,
          endDate: publishedDate,
          emptyLinks,
          emptyMedia,
          withDeleted: O.getOrElse(() => false)(withDeleted),
          withDrafts: O.getOrElse(() => false)(withDeleted),
          ...queryOptions,
        }),
        TE.chain(({ results, totals: { scientificStudies } }) =>
          pipe(
            A.sequence(TE.ApplicativeSeq)(
              results.map((r) => TE.fromEither(toEventV2IO(r))),
            ),
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
