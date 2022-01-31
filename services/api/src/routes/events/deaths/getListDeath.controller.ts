import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { DeathType } from "@econnessione/shared/io/http/Events/Death";
import { Route } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { toEventV2IO } from "../eventV2.io";
import { searchEventV2Query } from "../queries/searchEventsV2.query";

export const MakeGetListDeathEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.List,
    ({
      query: { victim, minDate, maxDate, keywords, media, links, withDeleted, withDrafts, ...query },
    }) => {
      ctx.logger.debug.log("Victim is %O", victim);
      const ormOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

      return pipe(
        searchEventV2Query(ctx)({
          ...query,
          type: O.some(DeathType.value),
          actors: pipe(
            victim,
            O.map((v) => [v] as any[])
          ),
          keywords,
          links,
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
