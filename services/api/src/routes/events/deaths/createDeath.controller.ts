import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toDeathIO } from "./death.io";
import { ActorEntity } from "@entities/Actor.entity";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { Route } from "routes/route.types";

export const MakeCreateDeathEventRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Create, ({ body }) => {
    return pipe(
      db.findOneOrFail(ActorEntity, { where: { id: body.victim } }),
      TE.chain((victim) =>
        db.save(DeathEventEntity, [{ ...body, victim: victim }])
      ),

      TE.chain(([event]) =>
        db.findOneOrFail(DeathEventEntity, {
          where: { id: event.id },
          loadRelationIds: true,
        })
      ),
      TE.chain((event) => TE.fromEither(toDeathIO(event))),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      }))
    );
  });
};
