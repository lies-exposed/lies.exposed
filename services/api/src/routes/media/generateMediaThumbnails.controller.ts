import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { GenerateThumbnailPubSub } from "@liexp/backend/lib/pubsub/media/generateThumbnail.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminEdit } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGenerateMediaThumbnailsRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminEdit.literals[0]])(ctx))(
    Endpoints.Media.Custom.GenerateThumbnails,
    ({ params: { id } }) => {
      return pipe(
        GenerateThumbnailPubSub.publish({ id })(ctx),
        TE.map((data) => ({
          body: {
            data: data > 0,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
