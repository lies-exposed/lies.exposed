import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toDeathIO } from "./death.io";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { Route } from "routes/route.types";

export const MakeDeleteDeathEventRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(DeathEventEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainFirst((event) => db.softDelete(DeathEventEntity, [event.id])),
      TE.chainEitherK(toDeathIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
