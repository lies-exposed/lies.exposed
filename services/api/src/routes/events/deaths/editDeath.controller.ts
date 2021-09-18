import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toDeathIO } from "./death.io";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { Route } from "routes/route.types";

export const MakeEditDeathEventRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Edit, ({ params: { id }, body }) => {
    const location = O.isSome(body.location) ? body.location.value : null;
    return pipe(
      db.findOneOrFail(DeathEventEntity, { where: { id } }),
      TE.chain((event) => db.save(DeathEventEntity, [{ ...event, location }])),
      TE.chain(([event]) =>
        db.findOneOrFail(DeathEventEntity, {
          where: { id: event.id },
          loadRelationIds: true,
        })
      ),
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
