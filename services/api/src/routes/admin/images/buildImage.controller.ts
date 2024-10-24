import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type BuildImageLayer } from "@liexp/shared/lib/io/http/admin/BuildImage.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { buildImageWithSharp } from "#flows/media/build-image/buildImageWithSharp.flow.js";
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
        buildImageWithSharp(layers)(ctx),
        TE.map((buffer) => ({
          body: buffer.toString("base64"),
          statusCode: 201,
        })),
      );
    },
  );
};
