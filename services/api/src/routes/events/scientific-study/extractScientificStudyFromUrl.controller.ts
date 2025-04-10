import { ScientificStudyEntity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { ScientificStudyIO } from "@liexp/backend/lib/io/event/scientific-study.io.js";
import { CreateEventFromURLPubSub } from "@liexp/backend/lib/pubsub/events/createEventFromURL.pubSub.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import {
  authenticationHandler,
  RequestDecoder,
} from "#utils/authenticationHandler.js";

export const MakeExtractScientificStudyFromURLRoute: Route = (r, ctx) => {
  AddEndpoint(
    r,
    authenticationHandler([
      AdminCreate.literals[0],
      AdminEdit.literals[0],
      AdminDelete.literals[0],
    ])(ctx),
  )(
    Endpoints.ScientificStudy.Custom.ExtractFromURL,
    ({ params: { id } }, req) => {
      return pipe(
        TE.Do,
        TE.bind("event", () =>
          ctx.db.findOneOrFail(ScientificStudyEntity, {
            where: { id: Equal(id) },
          }),
        ),
        TE.bind("link", ({ event }) =>
          ctx.db.findOneOrFail(LinkEntity, {
            where: { id: Equal(event.payload.url) },
          }),
        ),

        TE.bind("user", () =>
          pipe(
            RequestDecoder.decodeUserFromRequest(req, [
              AdminCreate.literals[0],
            ])(ctx),
            fp.TE.fromIOEither,
          ),
        ),
        TE.chainFirst(({ user, event, link }) =>
          CreateEventFromURLPubSub.publish({
            type: SCIENTIFIC_STUDY.literals[0],
            url: link.url,
            eventId: event.id,
            userId: user.id,
          })(ctx),
        ),
        TE.chainEitherK(({ event }) => ScientificStudyIO.decodeSingle(event)),
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
