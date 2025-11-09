import { TransactionIO } from "@liexp/backend/lib/io/event/transaction.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "effect/Option";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

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
        emptyActors: _emptyActors,
        emptyGroups: _emptyGroups,
        emptyKeywords: _emptyKeywords,
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
          type: O.some([TRANSACTION.literals[0]]),
          draft,
          actors: O.none(),
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
        TE.chainEitherK(({ results, totals: { transactions } }) =>
          pipe(
            results,
            TransactionIO.decodeMany,
            E.map((data) => ({ data, total: transactions })),
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
