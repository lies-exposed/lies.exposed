import { fp } from "@liexp/core/lib/fp/index.js";
import { type ThumbnailsExtra } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ConfigContext } from "../../../context/config.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type ImgProcClientContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type ServerError } from "../../../errors/index.js";
import { readExifMetadataFromImage } from "../readExifMetadataFromImage.flow.js";

export const extractThumbnailsExtra = <
  C extends ConfigContext &
    HTTPProviderContext &
    ImgProcClientContext &
    LoggerContext,
>(
  thumbnail: string,
): ReaderTaskEither<C, ServerError, ThumbnailsExtra> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("dimensions", () => readExifMetadataFromImage(thumbnail)),
    fp.RTE.bind("needRegenerateThumbnail", ({ dimensions }) => {
      return fp.RTE.fromReader((ctx: C) => {
        return (
          (dimensions.width ?? 0) > ctx.config.media.thumbnailWidth ||
          (dimensions.height ?? 0) > ctx.config.media.thumbnailHeight
        );
      });
    }),
    fp.RTE.map(({ dimensions, needRegenerateThumbnail }) => {
      return {
        thumbnailWidth: dimensions.width ?? 0,
        thumbnailHeight: dimensions.height ?? 0,
        thumbnails: [],
        needRegenerateThumbnail,
      };
    }),
  );
};
