import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toDeathIO } from "./death.io";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { Route } from "routes/route.types";

export const MakeGetDeathEventRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Get, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(DeathEventEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainEitherK(toDeathIO),
      TE.map((data) => ({
        body: { data },
        statusCode: 201,
      }))
    );
  });
};
