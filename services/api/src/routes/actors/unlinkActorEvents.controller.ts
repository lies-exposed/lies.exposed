import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminCreate } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { removeActorFromEvent } from "@liexp/shared/lib/helpers/event/addActorToEventPayload.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeUnlinkActorEventRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(
    r,
    authenticationHandler([AdminCreate.literals[0]])({ logger, jwt }),
  )(
    Endpoints.Actor.Custom.UnlinkEvent,
    ({ params: { id: actorId, eventId } }) => {
      logger.info.log("Unlinking event %s from actor %s", eventId, actorId);

      return pipe(
        // Verify actor exists
        db.findOneOrFail(ActorEntity, {
          where: { id: Equal(actorId) },
        }),
        // Find and update the event
        TE.chain(() =>
          db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(eventId) },
          }),
        ),
        TE.chain((event) => {
          const updatedEvent = removeActorFromEvent(event, actorId);
          return db.save(EventV2Entity, [updatedEvent]);
        }),
        TE.map(() => ({
          body: {
            data: { success: true },
          },
          statusCode: 200,
        })),
      );
    },
  );
};
