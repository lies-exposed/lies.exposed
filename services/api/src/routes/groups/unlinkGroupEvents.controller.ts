import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminCreate } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { removeGroupFromEventPayload } from "@liexp/shared/lib/helpers/event/addGroupToEventPayload.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeUnlinkGroupEventRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(
    r,
    authenticationHandler([AdminCreate.literals[0]])({ logger, jwt }),
  )(
    Endpoints.Group.Custom.UnlinkEvent,
    ({ params: { id: groupId, eventId } }) => {
      logger.info.log("Unlinking event %s from group %s", eventId, groupId);

      return pipe(
        // Verify group exists
        db.findOneOrFail(GroupEntity, {
          where: { id: Equal(groupId) },
        }),
        // Find and update the event
        TE.chain(() =>
          db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(eventId) },
          }),
        ),
        TE.chain((event) => {
          const updatedEvent = removeGroupFromEventPayload(event, groupId);
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
