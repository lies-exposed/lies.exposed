import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../../route.types.js";
import { toEventV2IO } from "../eventV2.io.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

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
          ]),
        ),

        TE.chain(([event]) =>
          db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(event.id) },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
