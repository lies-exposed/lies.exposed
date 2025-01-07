import { pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ImgProcClientContext } from "../../../context";
import { type ConfigContext } from "../../../context/config.context";
import { type ImgProcError } from "../../../providers/imgproc/imgproc.provider";

export const resizeThumbnailFlow =
  <C extends ImgProcClientContext & ConfigContext>(
    stream: ArrayBuffer,
  ): ReaderTaskEither<C, ImgProcError, Buffer> =>
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
