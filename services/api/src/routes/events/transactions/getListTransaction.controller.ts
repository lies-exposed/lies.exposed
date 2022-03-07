import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { TRANSACTION } from '@liexp/shared/io/http/Events/Transaction';
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toEventV2IO } from "../eventV2.io";
import { searchEventV2Query } from "../queries/searchEventsV2.query";
import { Route } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

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
        ...query
      },
    }) => {
      const ormOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query(ctx)({
          ...query,
          type: O.some([TRANSACTION.value]),
          actors: O.none,
          keywords,
          links,
          media,
          withDeleted: O.getOrElse(() => false)(withDeleted),
          withDrafts: O.getOrElse(() => false)(withDrafts),
          ...ormOptions,
        }),
        TE.chain(({ results, totals: { patents } }) =>
          pipe(
            results,
            A.traverse(E.Applicative)(toEventV2IO),
            TE.fromEither,
            TE.map((data) => ({ data, total: patents }))
          )
        ),
        TE.map((body) => ({
          body,
          statusCode: 200,
        }))
      );
    }
  );
};
