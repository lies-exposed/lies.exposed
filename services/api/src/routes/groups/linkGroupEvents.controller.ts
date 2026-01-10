import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { addGroupToEventPayload } from "@liexp/shared/lib/helpers/event/addGroupToEventPayload.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type ControllerError } from "../../io/ControllerError.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

interface LinkResult {
  eventId: UUID;
  success: boolean;
  reason?: string;
}

export const MakeLinkGroupEventsRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(
    r,
    authenticationHandler([AdminCreate.literals[0]])({ logger, jwt }),
  )(
    Endpoints.Group.Custom.LinkEvents,
    ({ params: { id: groupId }, body: { eventIds } }) => {
      logger.info.log(
        "Linking %d events to group %s",
        eventIds.length,
        groupId,
      );

      return pipe(
        // Verify group exists
        db.findOneOrFail(GroupEntity, {
          where: { id: Equal(groupId) },
        }),
        // Process each event
        TE.chain(() =>
          pipe(
            [...eventIds],
            A.traverse(TE.ApplicativeSeq)((eventId) =>
              pipe(
                db.findOneOrFail(EventV2Entity, {
                  where: { id: Equal(eventId) },
                }),
                TE.chain((event) => {
                  const updatedEvent = addGroupToEventPayload(event, groupId);
                  if (!updatedEvent) {
                    return TE.right<ControllerError, LinkResult>({
                      eventId,
                      success: false,
                      reason: `Event type '${event.type}' doesn't support adding groups`,
                    });
                  }
                  return pipe(
                    db.save(EventV2Entity, [updatedEvent]),
                    TE.map((): LinkResult => ({ eventId, success: true })),
                  );
                }),
                TE.orElse(() =>
                  TE.right<ControllerError, LinkResult>({
                    eventId,
                    success: false,
                    reason: "Event not found",
                  }),
                ),
              ),
            ),
          ),
        ),
        TE.map((results) => ({
          body: {
            data: {
              linked: results
                .filter((r): r is LinkResult & { success: true } => r.success)
                .map((r) => r.eventId),
              failed: results
                .filter(
                  (r): r is LinkResult & { success: false; reason: string } =>
                    !r.success,
                )
                .map((r) => ({
                  eventId: r.eventId,
                  reason: r.reason ?? "Unknown error",
                })),
            },
          },
          statusCode: 200,
        })),
      );
    },
  );
};
