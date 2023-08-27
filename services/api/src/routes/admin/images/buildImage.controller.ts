import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { toColorHash } from "@liexp/shared/lib/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type sharp from "sharp";
import { type GravityEnum } from "sharp";
import { toControllerError } from "@io/ControllerError";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

const DEFAULT_TEXT_WIDTH = 300;
const DEFAULT_TEXT_HEIGHT = 180;

const isHorizontalGravity = (g: keyof GravityEnum): boolean =>
  g === "east" || g === "west";

const isSouthishGravity = (g: keyof GravityEnum): boolean =>
  g.includes("south");

const isNorthiGravity = (g: keyof GravityEnum): boolean => g.includes("north");

const getSize =
  (g: keyof GravityEnum, width: number) =>
  (
    useDefault: () => number,
    on: {
      onEast?: (n: number) => number;
      onWest?: (n: number) => number;
      onNorth?: (n: number) => number;
      onSouth?: (n: number) => number;
    },
  ): number => {
    if (g === "east") {
      return on.onEast?.(width) ?? useDefault();
    } else if (g === "west") {
      return on.onWest?.(width) ?? useDefault();
    } else if (isSouthishGravity(g)) {
      return on.onSouth?.(width) ?? useDefault();
    } else if (isNorthiGravity(g)) {
      return on.onNorth?.(width) ?? useDefault();
    }
    return useDefault();
  };

export const MakeAdminBuildImageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Admin.Custom.BuildImage,
    ({
      body: {
        text,
        media,
        textBlend,
        textWidth: _textWidth,
        textGravity,
        background,
      },
      headers,
    }) => {
      ctx.logger.debug.log("Headers %O", { headers });
      return pipe(
        ctx.http.get<Buffer>(media, { responseType: "arraybuffer" }),
        TE.mapLeft(toControllerError),
        TE.chain((buf) =>
          pipe(
            ctx.imgProc.readExif(buf, {}),
            TE.map((exif) => ({ exif, buf })),
          ),
        ),
        TE.chain(({ buf: mediaBuffer, exif }) =>
          ctx.imgProc.run(async (sharp) => {
            const imageHeight = exif["Image Height"]?.value ?? 600;
            const imageWidth = exif["Image Width"]?.value ?? 600;

            ctx.logger.debug.log(
              `Using image %s (w=%s h=%s)`,
              media,
              imageWidth,
              imageHeight,
            );

            const height = imageHeight > imageWidth ? imageHeight : imageWidth;
            const width = imageHeight > imageWidth ? imageHeight : imageWidth;

            const textWidth = isHorizontalGravity(textGravity as any)
              ? _textWidth ?? DEFAULT_TEXT_WIDTH
              : width;
            const textHeight = isHorizontalGravity(textGravity as any)
              ? height
              : DEFAULT_TEXT_HEIGHT;

            const getSizeForGravity = getSize(textGravity as any, width);

            ctx.logger.debug.log(`Creating text layer with "%s" => %O`, text, {
              blend: textBlend,
              gravity: textGravity,
            });

            const mediaHeight = getSizeForGravity(() => height, {
              onEast: () => height * 2,
              onWest: () => height * 2,
            });

            const mediaLayer = await sharp(mediaBuffer)
              .resize({ width, height: mediaHeight, fit: "cover" })
              .toBuffer();

            const imageLeft = getSizeForGravity(() => 0, {
              onWest: () => textWidth,
            });

            const layers: sharp.OverlayOptions[] = [
              {
                input: mediaLayer,
                left: imageLeft,
                top: 0,
                gravity: isSouthishGravity(textGravity as any)
                  ? "north"
                  : "center",
              },
            ];

            if (background) {
              const backgroundWidth = getSizeForGravity(() => width, {
                onEast: (w) => textWidth,
                onWest: () => textWidth,
              });

              const backgroundLeft = getSizeForGravity(() => 0, {
                onEast: (w) => w,
                onWest: () => 0,
              });

              const backgroundTop = getSizeForGravity(() => 0, {
                onSouth: () => height - textHeight,
              });
              ctx.logger.debug.log(`Text background sizes %O`, {
                height: textHeight,
                width: backgroundWidth,
                left: backgroundLeft,
                top: backgroundTop,
              });
              layers.push({
                input: {
                  create: {
                    background: toColorHash(background),
                    width: backgroundWidth,
                    height: textHeight,
                    channels: 4,
                  },
                },
                left: backgroundLeft,
                top: backgroundTop,
                gravity: textGravity as any,
              });
            }

            const textLayerWidth = textWidth - 15 * 2;
            const textLayerHeight = getSizeForGravity(
              () => textHeight - 15 * 2,
              {
                onEast: () => textHeight * 1.8 - 15 * 2,
                onWest: () => textHeight * 1.8 - 15 * 2,
              },
            );
            const textLayerTop = getSizeForGravity(() => 15, {
              onSouth: () => height - textHeight + 15,
            });
            const textLayerLeft = getSizeForGravity(() => 15, {
              onEast: (w) => w + 15,
              onWest: () => 15,
            });

            ctx.logger.debug.log(`Text layer sizes %O`, {
              width: textLayerWidth,
              height: textLayerHeight,
              left: textLayerLeft,
              top: textLayerTop,
            });
            layers.push({
              input: {
                text: {
                  font: "arial",
                  text,
                  width: textLayerWidth,
                  height: textLayerHeight,
                  wrap: "word",
                },
              },
              blend: textBlend as any,
              gravity: textGravity as any,
              top: textLayerTop,
              left: textLayerLeft,
            });

            ctx.logger.debug.log(`Result image sizes %O`, { width, height });

            const frameWidth = getSizeForGravity(() => width, {
              onEast: (w) => w + textWidth,
              onWest: (w) => w + textWidth,
            });

            const frameHeight = getSizeForGravity(() => height, {
              onEast: (w) => height * 2,
              onWest: (w) => height * 2,
            });
            const frameLeft = 0;
            const frameTop = 0;

            const frame: sharp.OverlayOptions = {
              create: {
                width: frameWidth,
                height: frameHeight,
                channels: 4,
                background: background
                  ? toColorHash(background)
                  : "transparent",
              },
              left: frameLeft,
              top: frameTop,
            };

            ctx.logger.debug.log(`Frame image sizes %O`, {
              width,
              height,
              left: frameLeft,
              top: frameTop,
            });

            return await sharp(frame)
              .composite(layers)
              .sharpen()
              .toFormat("png")
              .toBuffer();
          }),
        ),
        TE.map((buffer) => ({
          body: buffer.toString("base64"),
          statusCode: 201,
        })),
      );
    },
  );
};
