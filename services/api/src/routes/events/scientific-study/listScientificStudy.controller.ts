import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { searchEventV2Query } from "../queries/searchEventsV2.query";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

export const MakeListScientificStudyRoute: Route = (
  r,
  { db, logger, env, ...ctx }
) => {
  AddEndpoint(r)(
    Endpoints.ScientificStudy.List,
    ({
      query: { publishedDate, publishedBy, title, withDrafts, ...query },
    }) => {
      const queryOptions = getORMOptions({ ...query }, env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query({ db, logger, env, ...ctx })({
          type: O.some([SCIENTIFIC_STUDY.value]),
          groups: publishedBy,
          actors: O.none,
          groupsMembers: O.none,
          keywords: O.none,
          links: O.none,
          media: O.none,
          title,
          startDate: publishedDate,
          endDate: publishedDate,
          withDeleted: false,
          withDrafts: pipe(
            withDrafts,
            O.getOrElse((): boolean => false)
          ),
          ...queryOptions,
        }),
        TE.chain(({ results, totals: { scientificStudies } }) =>
          pipe(
            A.sequence(TE.ApplicativeSeq)(
              results.map((r) => TE.fromEither(toEventV2IO(r)))
            ),
            TE.map((data) => ({ data, total: scientificStudies }))
          )
        ),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
