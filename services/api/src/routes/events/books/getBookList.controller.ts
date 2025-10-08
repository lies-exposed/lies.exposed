import { BookIO } from "@liexp/backend/lib/io/event/book.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { DBService } from "@liexp/backend/lib/services/db.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "effect/Option";
import * as E from "fp-ts/lib/Either.js";
import { type ServerContext } from "../../../context/context.type.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

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
        emptyActors: _emptyActors,
        emptyGroups: _emptyGroups,
        emptyKeywords: _emptyKeywords,
        emptyLinks,
        emptyMedia,
        spCount,
        onlyUnshared,
        publisher: _publisher,
        locations: _locations,
        groups,
        groupsMembers: _groupsMembers,
        actors,
        q,
        ids: _ids,
        startDate: _startDate,
        endDate: _endDate,
        exclude: _exclude,
        ...query
      },
    }) => {
      return pipe(
        DBService.getORMOptions<ServerContext>({ ...query }),
        fp.RTE.fromReader,
        fp.RTE.chain((ormOptions) =>
          searchEventV2Query({
            ...query,
            q,
            draft,
            type: O.some([EVENT_TYPES.BOOK]),
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
        ),
        // ctx.logger.debug.logInTaskEither((out) => [
        //   `Book results %O \n %O`,
        //   out.results,
        //   (out.results[0].payload as any).authors,
        // ]),
        fp.RTE.chainEitherK(({ results, totals: { books } }) =>
          pipe(
            results,
            BookIO.decodeMany,
            E.map((data) => ({ data, total: books })),
          ),
        ),
        fp.RTE.map((body) => ({
          body,
          statusCode: 200,
        })),
      )(ctx);
    },
  );
};
