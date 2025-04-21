import { BuildImageWithSharpPubSub } from "@liexp/backend/lib/pubsub/buildImageWithSharp.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type BuildImageLayer } from "@liexp/shared/lib/io/http/admin/BuildImage.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminBuildImageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Admin.Custom.BuildImage,
    ({
      body: {
        layers: {
          media: mediaLayer,
          text: textLayer,
          watermark: watermarkLayer,
        },
      },
      headers,
    }) => {
      ctx.logger.debug.log("Headers %O", { headers });
      const layers: BuildImageLayer[] = mediaLayer ? [mediaLayer] : [];
      if (textLayer) {
        layers.push(textLayer);
      }
      if (watermarkLayer) {
        layers.push(watermarkLayer);
      }
      return pipe(
        BuildImageWithSharpPubSub.publish({ image: null, layers })(ctx),
        TE.map(() => ({
          body: { data: { success: true } },
          statusCode: 201,
        })),
      );
    },
  );
};
