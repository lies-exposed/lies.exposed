import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../../route.types";
import { toEventV2IO } from "../eventV2.io";
import { ActorEntity } from "@entities/Actor.entity";
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
            { ...body, payload: { ...data, victim: victim.id }, type: "Death" },
          ])
        ),

        TE.chain(([event]) =>
          db.findOneOrFail(EventV2Entity, {
            where: { id: event.id },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toEventV2IO),
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
