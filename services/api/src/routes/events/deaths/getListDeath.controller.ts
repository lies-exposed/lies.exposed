import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { DEATH } from "@liexp/shared/io/http/Events/Death";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toEventV2IO } from "../eventV2.io";
import { searchEventV2Query } from "../queries/searchEventsV2.query";
import { Route } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

export const MakeGetListDeathEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.List,
    ({
      query: {
        victim,
        draft,
        minDate,
        maxDate,
        keywords,
        media,
        links,
        withDeleted,
        withDrafts,
        ...query
      },
    }) => {
      ctx.logger.debug.log("Victim is %O", victim);
      const ormOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query(ctx)({
          ...query,
          draft,
          type: O.some([DEATH.value]),
          actors: victim,
          keywords,
          links,
          media,
          withDeleted: O.getOrElse(() => false)(withDeleted),
          withDrafts: O.getOrElse(() => false)(withDrafts),
          ...ormOptions,
        }),
        TE.chain(({ results, totals: { deaths } }) =>
          pipe(
            results,
            A.traverse(E.Applicative)(toEventV2IO),
            TE.fromEither,
            TE.map((data) => ({ data, total: deaths }))
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
