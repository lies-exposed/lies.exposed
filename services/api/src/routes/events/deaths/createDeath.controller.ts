import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "../../route.types";
import { toDeathIO } from "./death.io";
import { ActorEntity } from "@entities/Actor.entity";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";

export const MakeCreateDeathEventRoute: Route = (r, { db }) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.Create,
    ({ body: { links, keywords, media, payload, ...body } }) => {
      const data = foldOptionals({
        location: payload.location,
      });
      return pipe(
        db.findOneOrFail(ActorEntity, { where: { id: payload.victim } }),
        TE.chain((victim) =>
          db.save(EventV2Entity, [
            { ...body, payload: { ...data, victim: victim.id } },
          ])
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
    }
  );
};
