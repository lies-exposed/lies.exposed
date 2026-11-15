import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { DeathIO } from "@liexp/backend/lib/io/event/death.io.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminCreate } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeCreateDeathEventRoute: Route = (r, ctx) => {
  const { db } = ctx;
  AddEndpoint(r, authenticationHandler([AdminCreate.literals[0]])(ctx))(
    Endpoints.DeathEvent.Create,
    ({
      body: {
        links: _links,
        keywords: _keywords,
        media: _media,
        payload,
        ...body
      },
    }) => {
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
        TE.chainEitherK(DeathIO.decodeSingle),
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
