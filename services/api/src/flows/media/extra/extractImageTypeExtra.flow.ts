import { fp } from "@liexp/core/lib/fp/index.js";
import {
  type ImageMediaExtra,
  ImageMediaExtraMonoid,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { pipe } from "fp-ts/lib/function.js";
import { type SimpleImageMedia } from "../thumbnails/extractThumbnailFromImage.flow.js";
import { extractThumbnailsExtra } from "./extractThumbnailsExtra.flow.js";
import { readExifMetadataFromImage } from "#flows/common/readExifMetadataFromImage.flow.js";
import { type TEReader } from "#flows/flow.types.js";

export const extractImageTypeExtra = (
  media: SimpleImageMedia,
): TEReader<ImageMediaExtra> => {
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
        ...dimensions,
        ...thumbnailsExtra,
      });
    }),
  );
};
