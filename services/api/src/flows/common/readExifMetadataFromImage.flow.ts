import { decodeExifTag } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ServerContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";
import { fetchFromRemote } from "#flows/media/thumbnails/fetchFromRemote.flow.js";
import { toControllerError } from "#io/ControllerError.js";

interface ExifMetadata {
  width?: number;
  height?: number;
}

const readExifMetadataFromBuffer =
  (buf: ArrayBuffer): TEReader<ExifReader.Tags> =>
  (ctx) => {
    return ctx.imgProc.readExif(buf as any, {});
  };

export const readExifMetadataFromImage = (
  location: string,
): TEReader<ExifMetadata> => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
    fp.RTE.chainTaskEitherK(fetchFromRemote(location)),
    fp.RTE.mapLeft(toControllerError),
    fp.RTE.chain(readExifMetadataFromBuffer),
    fp.RTE.chain((dimensions) =>
      fp.RTE.fromReader((ctx) => {
        ctx.logger.debug.log("Exif metadata", dimensions);
        return {
          width: decodeExifTag(dimensions["Image Width"]),
          height: decodeExifTag(dimensions["Image Height"]),
        };
      }),
    ),
  );
};
