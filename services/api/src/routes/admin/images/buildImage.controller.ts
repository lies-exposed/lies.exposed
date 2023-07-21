import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { toColorHash } from "@liexp/shared/lib/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type sharp from "sharp";
import { toControllerError } from "@io/ControllerError";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeAdminBuildImageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Admin.Custom.BuildImage,
    ({
      body: { text, media, textBlend, textGravity, background },
      headers,
    }) => {
      ctx.logger.debug.log("Headers %O", { headers });
      const width = 600;
      const height = 600;
      return pipe(
        ctx.http.get<Buffer>(media, { responseType: "arraybuffer" }),
        TE.mapLeft(toControllerError),
        TE.chain((mediaBuffer) =>
          ctx.imgProc.run(async (sharp) => {
            ctx.logger.debug.log(`Creating text layer with "%s" => %O`, text, {
              blend: textBlend,
              gravity: textGravity,
            });
            ctx.logger.debug.log(`Using media %s %O`, media, mediaBuffer);

            const layers: sharp.OverlayOptions[] = [];
            if (background) {
              layers.push({
                input: {
                  create: {
                    background: toColorHash(background),
                    width: 600,
                    height: 180,
                    channels: 4,
                  },
                },
                gravity: textGravity as any,
              });
            }

            layers.push({
              input: {
                text: {
                  font: "arial",
                  text,
                  width: 600 - 15 * 2,
                  height: 150,
                  wrap: "word",
                },
              },
              blend: textBlend as any,
              gravity: textGravity as any,
              top: textGravity.includes("south") ? 600 - (150 + 15) : 15,
              left: 15,
            });

            return await sharp(mediaBuffer)
              .resize(width, height)
              .composite(layers)
              .toFormat("png")
              .toBuffer();
          }),
        ),
        ctx.logger.debug.logInTaskEither(`Media buffer %O`),
        TE.map((buffer) => ({
          body: buffer.toString("base64"),
          statusCode: 201,
        })),
      );
    },
  );
};
