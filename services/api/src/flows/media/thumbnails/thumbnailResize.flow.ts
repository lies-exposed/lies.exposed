import { pipe } from "@liexp/core/lib/fp/index.js";
import { type TEReader } from "#flows/flow.types.js";

export const resizeThumbnailFlow =
  (stream: ArrayBuffer): TEReader<Buffer> =>
  (ctx) => {
    return pipe(
      ctx.imgProc.run((sharp) => {
        return sharp(stream)
          .keepExif()
          .rotate()
          .resize({
            width: ctx.config.media.thumbnailWidth,
            fit: "cover",
            withoutEnlargement: true,
          })
          .toFormat("png")
          .toBuffer();
      }),
    );
  };
