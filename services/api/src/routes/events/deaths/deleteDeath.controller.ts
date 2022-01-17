import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "../../route.types";
import { toDeathIO } from "./death.io";
import { DeathEventViewEntity } from "@entities/events/DeathEvent.entity";

export const MakeDeleteDeathEventRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(DeathEventViewEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainFirst((event) => db.softDelete(DeathEventViewEntity, [event.id])),
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
