import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ImageType,
  type MediaExtra,
  MP4Type,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { type SimpleMP4Media } from "../thumbnails/extractMP4Thumbnail.flow.js";
import { type SimpleImageMedia } from "../thumbnails/extractThumbnailFromImage.flow.js";
import { extractImageTypeExtra } from "./extractImageTypeExtra.flow.js";
import { extractMP4Extra } from "./extractMP4Extra.js";
import { extractThumbnailsExtra } from "./extractThumbnailsExtra.flow.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";

export const extractMediaExtra = (
  media: MediaEntity,
): TEReader<MediaExtra | undefined> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("mediaExtra", () => {
      if (ImageType.is(media.type)) {
        return extractImageTypeExtra(media as SimpleImageMedia);
      }
      if (MP4Type.is(media.type)) {
        return extractMP4Extra(media as SimpleMP4Media);
      }

      return fp.RTE.right(media.extra ?? undefined);
    }),
    fp.RTE.bind("thumbnailExtra", () => {
      if (media.thumbnail) {
        return extractThumbnailsExtra(media.thumbnail);
      }
      return fp.RTE.right(media.extra ?? ThumbnailsExtraMonoid.empty);
    }),
    fp.RTE.map(({ mediaExtra, thumbnailExtra }) => ({
      ...mediaExtra,
      ...thumbnailExtra,
    })),
  );
};
