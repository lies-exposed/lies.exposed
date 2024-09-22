import { fp } from "@liexp/core/lib/fp/index.js";
import { type ThumbnailsExtra } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { pipe } from "fp-ts/lib/function.js";
import { readExifMetadataFromImage } from "#flows/common/readExifMetadataFromImage.flow.js";
import { type TEFlow } from "#flows/flow.types.js";

export const extractThumbnailsExtra: TEFlow<[string], ThumbnailsExtra> =
  (ctx) => (thumbnail) => {
    return pipe(
      fp.TE.Do,
      fp.TE.bind("dimensions", () => readExifMetadataFromImage(ctx)(thumbnail)),
      fp.TE.bind("needRegenerateThumbnail", ({ dimensions }) => {
        return fp.TE.fromIO(() => {
          return (
            (dimensions.width ?? 0) > ctx.config.media.thumbnailWidth ||
            (dimensions.height ?? 0) > ctx.config.media.thumbnailHeight
          );
        });
      }),
      fp.TE.map(({ dimensions, needRegenerateThumbnail }) => {
        return {
          thumbnailWidth: dimensions.width ?? 0,
          thumbnailHeight: dimensions.height ?? 0,
          thumbnails: [],
          needRegenerateThumbnail,
        };
      }),
    );
  };
