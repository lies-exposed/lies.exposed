import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ImageType,
  type MediaExtra,
  MP4Type,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { type SimpleMP4Media } from "../thumbnails/extractMP4Thumbnail.flow.js";
import { type SimpleImageMedia } from "../thumbnails/extractThumbnailFromImage.js";
import { extractImageTypeExtra } from "./extractImageTypeExtra.flow.js";
import { extractMP4Extra } from "./extractMP4Extra.js";
import { extractThumbnailsExtra } from "./extractThumbnailsExtra.flow.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";

export const extractMediaExtra: TEFlow<[MediaEntity], MediaExtra | undefined> =
  (ctx) => (media) => {
    return pipe(
      fp.TE.Do,
      fp.TE.bind("mediaExtra", () => {
        if (ImageType.is(media.type)) {
          return extractImageTypeExtra(ctx)(media as SimpleImageMedia);
        }
        if (MP4Type.is(media.type)) {
          return extractMP4Extra(ctx)(media as SimpleMP4Media);
        }

        return fp.TE.right(media.extra ?? undefined);
      }),
      fp.TE.bind("thumbnailExtra", () => {
        if (media.thumbnail) {
          return extractThumbnailsExtra(ctx)(media.thumbnail);
        }
        return fp.TE.right(media.extra ?? ThumbnailsExtraMonoid.empty);
      }),
      fp.TE.map(({ mediaExtra, thumbnailExtra }) => ({
        ...mediaExtra,
        ...thumbnailExtra,
      })),
    );
  };
