import path from "path";
import { type ImgProcError } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type BuildImageLayer,
  type MediaImageLayer,
  type TextLayer,
  type WatermarkLayer,
} from "@liexp/shared/lib/io/http/admin/BuildImage";
import { toColorHash } from "@liexp/shared/lib/utils/colors.js";
import { type OverlayOptions, type GravityEnum } from "sharp";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

const DEFAULT_TEXT_WIDTH = 100;
const DEFAULT_TEXT_HEIGHT = 20;

const sizePercentage = (size: number, percentage: number): number =>
  Math.ceil((percentage / 100) * size);

// const isHorizontalGravity = (g: keyof GravityEnum): boolean =>
//   g === "east" || g === "west";

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
      return pipe(on.onEast?.(width) ?? useDefault(), Math.ceil);
    } else if (g === "west") {
      return pipe(on.onWest?.(width) ?? useDefault(), Math.ceil);
    } else if (isSouthishGravity(g)) {
      return pipe(on.onSouth?.(width) ?? useDefault(), Math.ceil);
    } else if (isNorthiGravity(g)) {
      return pipe(on.onNorth?.(width) ?? useDefault(), Math.ceil);
    }
    return pipe(useDefault(), Math.ceil);
  };

type SharpOverlayOptionsWithSize = OverlayOptions & {
  width: number;
  height: number;
};

type AddLayerFlow = TEFlow<
  [BuildImageLayer, SharpOverlayOptionsWithSize | undefined],
  SharpOverlayOptionsWithSize[]
>;

const addLayer: AddLayerFlow = (ctx) => (layer, parent) => {
  const fetchSource =
    layer.type === "media"
      ? addMediaImageLayer(ctx)(layer, parent)
      : layer.type === "watermark"
        ? addWatermarkLayer(ctx)(layer, parent)
        : addTextLayer(ctx)(layer, parent);

  return pipe(fetchSource);
};

const addMediaImageLayer: TEFlow<
  [MediaImageLayer, SharpOverlayOptionsWithSize | undefined],
  SharpOverlayOptionsWithSize[]
> = (ctx) => (layer, parent) => {
  ctx.logger.debug.log('Adding "media" layer %O (parent %O)', layer, parent);
  return pipe(
    ctx.http.get<Buffer>(layer.url, {
      responseType: "arraybuffer",
    }),
    fp.TE.mapLeft(toControllerError),
    fp.TE.chain((buf) =>
      pipe(
        parent?.width && parent.height
          ? fp.TE.right<ImgProcError, ExifReader.Tags>({
              "Image Width": parent.width,
              "Image Height": parent.width,
            } as any)
          : ctx.imgProc.readExif(buf, {}),
        fp.TE.map((exif) => ({ exif, buf })),
      ),
    ),
    fp.TE.map(({ exif, buf }) => {
      ctx.logger.debug.log(`Media info %O`, exif);
      return [
        {
          blend: layer.blend as any,
          gravity: layer.gravity as any,
          input: buf,
          left: 0,
          top: 0,
          width:
            exif["Image Width"]?.value ?? parent?.width ?? DEFAULT_TEXT_WIDTH,
          height:
            exif["Image Height"]?.value ??
            parent?.height ??
            DEFAULT_TEXT_HEIGHT,
        },
      ];
    }),
  );
};
const addTextLayer: TEFlow<
  [TextLayer, SharpOverlayOptionsWithSize | undefined],
  SharpOverlayOptionsWithSize[]
> = (ctx) => (layer, parent) => {
  return fp.TE.tryCatch(async () => {
    ctx.logger.debug.log('Adding "text" layer %O (parent %O)', layer, parent);
    const width = parent?.width ?? DEFAULT_TEXT_WIDTH;
    const height = parent?.height ?? DEFAULT_TEXT_HEIGHT;
    const layerWidth = sizePercentage(width, layer.width ?? DEFAULT_TEXT_WIDTH);
    const layerHeight = sizePercentage(
      height,
      layer.height ?? DEFAULT_TEXT_HEIGHT,
    );
    const getSizeForGravity = getSize(layer.gravity as any, layerWidth);

    const layers: SharpOverlayOptionsWithSize[] = [];
    if (layer.background) {
      const backgroundWidth = getSizeForGravity(() => layerWidth, {
        onEast: (w) => layerWidth,
        onWest: () => layerWidth,
      });

      const backgroundLeft = getSizeForGravity(() => 0, {
        onEast: (w) => w,
        onWest: () => 0,
      });

      const backgroundTop = getSizeForGravity(() => 0, {
        onSouth: () => height - layerHeight,
      });
      ctx.logger.debug.log(`Text background sizes %O`, {
        height: layerHeight,
        width: backgroundWidth,
        left: backgroundLeft,
        top: backgroundTop,
      });
      layers.push({
        input: {
          create: {
            background: toColorHash(layer.background),
            width: backgroundWidth,
            height: layerHeight,
            channels: 4,
          },
        },
        left: Math.ceil(backgroundLeft),
        top: Math.ceil(backgroundTop),
        gravity: layer.gravity as any,
        width: layerWidth,
        height: layerHeight,
      });
    }

    const textLayerPadding = layerWidth / 20;
    const textLayerWidth = layerWidth - textLayerPadding * 2;
    const textLayerHeight = getSizeForGravity(
      () => layerHeight - textLayerPadding * 2,
      {
        onEast: () => layerHeight * 1.8 - textLayerPadding * 2,
        onWest: () => layerHeight * 1.8 - textLayerPadding * 2,
      },
    );
    const textLayerTop = getSizeForGravity(() => textLayerPadding, {
      onSouth: () => height - layerHeight + textLayerPadding,
    });
    const textLayerLeft = getSizeForGravity(() => textLayerPadding, {
      onEast: (w) => w + textLayerPadding,
      onWest: () => textLayerPadding,
    });

    ctx.logger.info.log(`Text layer sizes %O`, {
      width: textLayerWidth,
      height: textLayerHeight,
      left: textLayerLeft,
      top: textLayerTop,
    });

    layers.push({
      input: {
        text: {
          font: "arial",
          text: `<span foreground="${toColorHash(layer.color ?? "000000")}">${
            layer.text
          }</span>`,
          width: textLayerWidth,
          height: textLayerHeight,
          wrap: "word",
          align: "center",
        },
      },
      blend: layer.blend as any,
      gravity: layer.gravity as any,
      top: Math.ceil(textLayerTop),
      left: Math.ceil(textLayerLeft),
      width,
      height,
    });
    return layers;
  }, toControllerError);
};

const addWatermarkLayer: TEFlow<
  [WatermarkLayer, SharpOverlayOptionsWithSize | undefined],
  SharpOverlayOptionsWithSize[]
> = (ctx) => (layer, parent) => {
  ctx.logger.debug.log(
    "Adding watermark layer for %O (parent %O)",
    layer,
    parent,
  );

  const parentHeight = Math.ceil(parent?.height ?? DEFAULT_TEXT_HEIGHT);
  const parentWidth = Math.ceil(parent?.width ?? DEFAULT_TEXT_WIDTH);

  const logoWidth = sizePercentage(parentHeight, layer.height ?? 16);

  return pipe(
    ctx.imgProc.run(async (sharp) => {
      const logoImagePath = path.resolve(
        ctx.config.dirs.cwd,
        "assets/logo/logo192.png",
      );

      return await sharp(logoImagePath).resize(logoWidth, logoWidth).toBuffer();
    }),

    fp.TE.map((input) => {
      const watermarkLayer = {
        input,
        blend: layer.blend as any,
        gravity: layer.gravity as any,
        top: Math.ceil(parentHeight - (logoWidth + logoWidth / 2)),
        left: Math.ceil(parentWidth - (logoWidth + logoWidth / 2)),
        width: logoWidth,
        height: logoWidth,
      };

      ctx.logger.debug.log(
        "Watermark layer with width %s: %O",
        logoWidth,
        watermarkLayer,
      );

      return [watermarkLayer];
    }),
  );
};

export const buildImageWithSharp: TEFlow<[BuildImageLayer[]], Buffer> =
  (ctx) => (layers) => {
    const [first, ...rest] = layers;
    return pipe(
      rest,
      fp.A.reduce(addLayer(ctx)(first, undefined), (te, l) =>
        pipe(
          te,
          fp.TE.chain((acc) =>
            pipe(
              addLayer(ctx)(l, acc[0] as any),
              fp.TE.map((l) => acc.concat(l)),
            ),
          ),
        ),
      ),
      fp.TE.chain((layers) =>
        ctx.imgProc.run(async (sharp) => {
          ctx.logger.debug.log(`Result image sizes %O`, layers);
          const layer: any = layers[0];
          const width = Math.ceil(layer.width);
          const height = Math.ceil(layer.height);
          const getSizeForGravity = getSize(layer.gravity as any, width);
          const frameWidth = getSizeForGravity(() => width, {
            onEast: (w) => w * 2,
            onWest: (w) => w * 2,
          });

          const frameHeight = getSizeForGravity(() => height, {
            onEast: (w) => height * 2,
            onWest: (w) => height * 2,
          });
          const frameLeft = 0;
          const frameTop = 0;

          const frame: OverlayOptions = {
            create: {
              width: frameWidth,
              height: frameHeight,
              channels: 4,
              background: "transparent",
            },
            left: frameLeft,
            top: frameTop,
          };

          ctx.logger.debug.log(`Frame image sizes %O`, {
            width: frameWidth,
            height: frameHeight,
            left: frameLeft,
            top: frameTop,
          });

          const imageBuf = await sharp(frame)
            .composite(layers)
            .sharpen()
            .toFormat("png")
            .toBuffer();

          return imageBuf;
        }),
      ),
    );
  };
