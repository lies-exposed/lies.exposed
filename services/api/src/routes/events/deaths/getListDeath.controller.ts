import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toDeathIO } from "./death.io";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { Route } from "routes/route.types";

export const MakeGetListDeathEventRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.List, () => {
    return pipe(
      db.findAndCount(DeathEventEntity, { loadRelationIds: true }),
      TE.chain(([results, total]) =>
        pipe(
          results,
          A.traverse(E.Applicative)(toDeathIO),
          TE.fromEither,
          TE.map((data) => ({ data, total }))
        )
      ),
      TE.map((body) => ({
        body,
        statusCode: 201,
      }))
    );
  });
};
