import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { CreateScientificStudyFromURLPubSub } from "@liexp/backend/lib/pubsub/events/scientific-study/createFromURL.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
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
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeExtractScientificStudyFromURLRoute: Route = (r, ctx) => {
  AddEndpoint(
    r,
    authenticationHandler([
      AdminCreate.value,
      AdminEdit.value,
      AdminDelete.value,
    ])(ctx),
  )(
    Endpoints.ScientificStudy.Custom.ExtractFromURL,

    ({ params: { id } }, req) => {
      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, { where: { id: Equal(id) } }),
        TE.chainFirst((event) =>
          CreateScientificStudyFromURLPubSub.publish({
            type: SCIENTIFIC_STUDY.value,
            url: (event.payload as any).url,
          })(ctx),
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
