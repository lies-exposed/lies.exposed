import { pipe } from "@liexp/core/lib/fp/index.js";
import { type TEFlow } from "#flows/flow.types.js";

export const resizeThumbnailFlow: TEFlow<[ArrayBuffer], Buffer> =
  (ctx) => (stream) => {
    return pipe(
      ctx.imgProc.run((sharp) => {
        return sharp(stream)
          .keepExif()
          .rotate()
          .resize({
            width: 640,
            withoutEnlargement: true,
          })
          .toFormat("png")
          .toBuffer();
      }),
    );
  };
