import { fp } from "@liexp/core/lib/fp/index.js";
import {
  type ImageMediaExtra,
  ImageMediaExtraMonoid,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ConfigContext } from "../../../context/config.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type ImgProcClientContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type ServerError } from "../../../errors/ServerError.js";
import { readExifMetadataFromImage } from "../readExifMetadataFromImage.flow.js";
import { type SimpleImageMedia } from "../thumbnails/extractThumbnailFromImage.flow.js";
import { extractThumbnailsExtra } from "./extractThumbnailsExtra.flow.js";

export const extractImageTypeExtra = <
  C extends ConfigContext &
    HTTPProviderContext &
    ImgProcClientContext &
    LoggerContext,
>(
  media: SimpleImageMedia,
): ReaderTaskEither<C, ServerError, ImageMediaExtra> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("dimensions", () => {
      return readExifMetadataFromImage(media.location);
    }),
    fp.RTE.bind("thumbnailsExtra", () => {
      if (media.thumbnail) {
        return extractThumbnailsExtra(media.thumbnail);
      }
      return fp.RTE.right(ThumbnailsExtraMonoid.empty);
    }),
    fp.RTE.map(({ dimensions, thumbnailsExtra }) => {
      return ImageMediaExtraMonoid.concat(ImageMediaExtraMonoid.empty, {
        width: 0,
        height: 0,
        ...dimensions,
        ...thumbnailsExtra,
      });
    }),
  );
};
