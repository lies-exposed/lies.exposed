import { decodeExifTag } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type TEFlow } from "#flows/flow.types.js";
import { fetchFromRemote } from "#flows/media/thumbnails/fetchFromRemote.flow.js";
import { toControllerError } from "#io/ControllerError.js";

interface ExifMetadata {
  width?: number;
  height?: number;
}

export const readExifMetadataFromImage: TEFlow<[string], ExifMetadata> =
  (ctx) => (location) => {
    return pipe(
      fetchFromRemote(ctx)(location),
      fp.TE.mapLeft(toControllerError),
      fp.TE.chain((buf) => ctx.imgProc.readExif(buf as any, {})),
      fp.TE.map((dimensions) => {
        ctx.logger.debug.log("Exif metadata", dimensions);
        return {
          width: decodeExifTag(dimensions["Image Width"]),
          height: decodeExifTag(dimensions["Image Height"]),
        };
      }),
    );
  };
