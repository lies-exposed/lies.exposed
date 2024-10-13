import { fp } from "@liexp/core/lib/fp/index.js";
import { type ThumbnailsExtra } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { pipe } from "fp-ts/lib/function.js";
import { readExifMetadataFromImage } from "#flows/common/readExifMetadataFromImage.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { type RouteContext } from "#routes/route.types.js";

export const extractThumbnailsExtra = (
  thumbnail: string,
): TEReader<ThumbnailsExtra> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("dimensions", () => readExifMetadataFromImage(thumbnail)),
    fp.RTE.bind("needRegenerateThumbnail", ({ dimensions }) => {
      return fp.RTE.fromReader((ctx: RouteContext) => {
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
