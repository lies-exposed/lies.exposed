import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { CreateEventFromURLPubSub } from "@liexp/backend/lib/pubsub/events/createEventFromURL.pubSub.js";
import { createEventQuery } from "@liexp/backend/lib/queries/events/createEvent.query.js";
import { UserRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventFromURLBody } from "@liexp/shared/lib/io/http/Events/index.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial, Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import {
  authenticationHandler,
  RequestDecoder,
} from "#utils/authenticationHandler.js";

export const CreateEventRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Event.Create,
    ({ body }, req) => {
      return pipe(
        RequestDecoder.decodeUserFromRequest(req, [AdminCreate.value])(ctx),
        TE.fromIOEither,
        TE.chain((u) =>
          UserRepository.findOneOrFail({ where: { id: Equal(u.id) } })(ctx),
        ),
        TE.chain((user) =>
          EventFromURLBody.is(body)
            ? pipe(
                uuid(),
                TE.right,
                TE.chainFirst((id) =>
                  CreateEventFromURLPubSub.publish({
                    ...body,
                    eventId: id,
                    userId: user.id,
                  })(ctx),
                ),
                TE.map(
                  (id) =>
                    ({
                      id,
                      type: body.type,
                      date: new Date(),
                    }) as DeepPartial<EventV2Entity>,
                ),
              )
            : createEventQuery(body)(ctx),
        ),
        LoggerService.TE.debug(ctx, "Create data %O"),
        TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(event.id) },
            loadRelationIds: {
              relations: ["media", "links", "keywords"],
            },
          }),
        ),
        TE.chainEitherK(EventV2IO.decodeSingle),
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
