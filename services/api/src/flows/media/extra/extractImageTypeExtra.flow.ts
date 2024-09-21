import { fp } from "@liexp/core/lib/fp/index.js";
import {
  type ImageMediaExtra,
  ImageMediaExtraMonoid,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { pipe } from "fp-ts/lib/function.js";
import { type SimpleImageMedia } from "../thumbnails/extractThumbnailFromImage.js";
import { extractThumbnailsExtra } from "./extractThumbnailsExtra.flow.js";
import { readExifMetadataFromImage } from "#flows/common/readExifMetadataFromImage.flow.js";
import { type TEFlow } from "#flows/flow.types.js";

export const extractImageTypeExtra: TEFlow<
  [SimpleImageMedia],
  ImageMediaExtra
> = (ctx) => (media) => {
  return pipe(
    fp.TE.Do,
    fp.TE.bind("dimensions", () => {
      return readExifMetadataFromImage(ctx)(media.location);
    }),
    fp.TE.bind("thumbnailsExtra", () => {
      if (media.thumbnail) {
        return extractThumbnailsExtra(ctx)(media.thumbnail);
      }
      return fp.TE.right(ThumbnailsExtraMonoid.empty);
    }),
    fp.TE.map(({ dimensions, thumbnailsExtra }) => {
      return ImageMediaExtraMonoid.concat(ImageMediaExtraMonoid.empty, {
        ...dimensions,
        ...thumbnailsExtra,
      });
    }),
  );
};
