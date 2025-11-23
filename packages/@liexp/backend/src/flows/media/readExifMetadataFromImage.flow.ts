import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type ImgProcClientContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { ServerError } from "../../errors/index.js";
import { decodeExifTag } from "../../providers/imgproc/imgproc.provider.js";
import { fetchAsBuffer } from "../url/fetchAsBuffer.flow.js";

interface ExifMetadata {
  width?: number;
  height?: number;
}

export const readExifMetadataFromImage = <
  C extends ImgProcClientContext & HTTPProviderContext & LoggerContext,
>(
  location: string,
): ReaderTaskEither<C, ServerError, ExifMetadata> => {
  return pipe(
    fp.RTE.ask<C>(),
    fp.RTE.chainTaskEitherK(fetchAsBuffer(location)),
    fp.RTE.mapLeft(ServerError.fromUnknown),
    fp.RTE.chain(
      (buffer) => (ctx) =>
        pipe(
          ctx.imgProc.readExif(buffer as unknown as string | File, {}),
          fp.TE.mapLeft(ServerError.fromUnknown),
        ),
    ),
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
