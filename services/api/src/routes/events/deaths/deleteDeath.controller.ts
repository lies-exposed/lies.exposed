import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toDeathIO } from "./death.io";
import { DeathEntity } from "@entities/events/DeathEvent.entity";
import { Route } from "routes/route.types";

export const MakeDeleteDeathEventRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(DeathEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainFirst((event) => db.softDelete(DeathEntity, [event.id])),
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
