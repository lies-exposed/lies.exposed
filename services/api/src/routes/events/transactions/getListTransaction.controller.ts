import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2IO } from "../eventV2.io.js";
import { searchEventV2Query } from "../queries/searchEventsV2.query.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeGetListTransactionEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.TransactionEvent.List,
    ({
      query: {
        keywords,
        media,
        links,
        withDeleted,
        withDrafts,
        draft,
        emptyActors,
        emptyGroups,
        emptyKeywords,
        emptyLinks,
        emptyMedia,
        onlyUnshared,
        spCount,
        ...query
      },
    }) => {
      const ormOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query({
          ...query,
          type: O.some([TRANSACTION.value]),
          draft,
          actors: O.none,
          keywords,
          links,
          media,
          emptyLinks,
          emptyMedia,
          withDeleted: O.getOrElse(() => false)(withDeleted),
          withDrafts: O.getOrElse(() => false)(withDrafts),
          spCount,
          onlyUnshared,
          ...ormOptions,
        })(ctx),
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
