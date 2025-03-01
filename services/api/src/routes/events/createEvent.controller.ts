import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { createEventQuery } from "@liexp/backend/lib/queries/events/createEvent.query.js";
import { UserRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type Event,
  EventFromURLBody,
  EVENTS,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { OpenAICreateEventFromURLType } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromURLQueue.js";
import { PendingStatus } from "@liexp/shared/lib/io/http/Queue/index.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type ControllerError } from "../../io/ControllerError.js";
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
        TE.chain(
          (user): TE.TaskEither<ControllerError, { success: true } | Event> =>
            EventFromURLBody.is(body)
              ? pipe(
                  uuid(),
                  TE.right,
                  TE.chainFirst((id) =>
                    ctx.queue.queue(OpenAICreateEventFromURLType.value).addJob({
                      id,
                      status: PendingStatus.value,
                      type: OpenAICreateEventFromURLType.value,
                      resource: EVENTS.value,
                      error: null,
                      question: null,
                      result: null,
                      prompt: null,
                      data: {
                        type: body.type,
                        url: body.url,
                      },
                    }),
                  ),
                  TE.map((id) => ({ success: true })),
                )
              : pipe(
                  createEventQuery(body)(ctx),
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
                ),
        ),
        LoggerService.TE.debug(ctx, "Create data %O"),
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
