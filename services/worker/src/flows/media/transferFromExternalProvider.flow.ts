import { fetchMedia } from "@liexp/backend/lib/flows/media/fetchMedia.flow.js";
import { upload } from "@liexp/backend/lib/flows/space/upload.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL, type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  ImageType,
  PDFType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { Schema } from "effect";
import { type RTE } from "../../types.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError } from "#io/worker.error.js";

type TransferableMediaType = ImageType | PDFType;
export const transferFromExternalProvider = (
  mediaId: UUID,
  url: URL,
  fileName: string,
  mimeType: MediaType,
): RTE<string> => {
  return pipe(
    mimeType,
    fp.RTE.fromPredicate(
      (t): t is TransferableMediaType =>
        Schema.is(Schema.Union(ImageType, PDFType))(t),
      () =>
        toWorkerError(new Error(`Can't transfer this media type: ${mimeType}`)),
    ),
    LoggerService.RTE.debug((mType) => [
      `Transferring media ${mediaId} from external provider %O`,
      { mediaId, url, fileName, mimeType: mType },
    ]),
    fp.RTE.chain((mType) =>
      pipe(
        fetchMedia(url),
        fp.RTE.mapLeft(toWorkerError),
        fp.RTE.chain((stream) => {
          return upload<WorkerContext>({
            Key: getMediaKey("media", mediaId, fileName, mType),
            Body: stream,
            ACL: "public-read",
            ContentType: mimeType,
          });
        }),
      ),
    ),
    LoggerService.RTE.debug((r) => [`Media uploaded %O`, r]),
    fp.RTE.map((r) => r.Location),
  );
};
