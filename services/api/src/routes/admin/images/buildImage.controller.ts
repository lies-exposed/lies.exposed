import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { buildImageWithSharp } from "@liexp/backend/lib/flows/media/admin/build-image/buildImageWithSharp.flow.js";
import { BuildImageWithSharpPubSub } from "@liexp/backend/lib/pubsub/buildImageWithSharp.pubSub.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type BuildImageLayer,
  type WatermarkLayer,
} from "@liexp/io/lib/http/admin/BuildImage.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

const DEFAULT_WATERMARK: WatermarkLayer = {
  type: "watermark",
  gravity: "southeast",
  blend: "over",
  width: 10,
  height: 10,
  background: undefined,
};

export const MakeAdminBuildImageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Admin.Custom.BuildImage,
    ({
      body: {
        defer,
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
      // Always include a watermark; fall back to the default if none was provided
      layers.push(watermarkLayer ?? DEFAULT_WATERMARK);

      const deferred = defer != null && defer === true ? true : false;

      if (deferred) {
        return pipe(
          BuildImageWithSharpPubSub.publish({ image: null, layers }),
          fp.RTE.map(() => ({
            body: { data: { success: true as const } },
            statusCode: 200 as const,
          })),
        )(ctx);
      }

      return pipe(
        buildImageWithSharp(layers),
        fp.RTE.map((imageBuffer) => ({
          body: { data: imageBuffer.toString("base64") },
          statusCode: 200 as const,
        })),
      )(ctx);
    },
  );
};
