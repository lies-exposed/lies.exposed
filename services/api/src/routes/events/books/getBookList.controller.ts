import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { BOOK } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2IO } from "../eventV2.io.js";
import { searchEventV2Query } from "../queries/searchEventsV2.query.js";
import { type Route } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeListBookEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.BookEvent.List,
    ({
      query: {
        draft,
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
        publisher,
        locations,
        groups,
        groupsMembers,
        actors,
        q,
        ids,
        startDate,
        endDate,
        exclude,
        ...query
      },
    }) => {
      const ormOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query(ctx)({
          ...query,
          q,
          draft,
          type: O.some([BOOK.value]),
          actors,
          groups,
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
        // ctx.logger.debug.logInTaskEither((out) => [
        //   `Book results %O \n %O`,
        //   out.results,
        //   (out.results[0].payload as any).authors,
        // ]),
        TE.chainEitherK(({ results, totals: { books } }) =>
          pipe(
            results,
            EventV2IO.decodeMany,
            E.map((data) => ({ data, total: books })),
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
