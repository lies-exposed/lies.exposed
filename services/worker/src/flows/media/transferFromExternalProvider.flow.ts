import type * as Stream from "node:stream";
import { upload } from "@liexp/backend/lib/flows/space/upload.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
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
export const transferFromExternalProvider =
  (
    mediaId: UUID,
    url: string,
    fileName: string,
    mimeType: MediaType,
  ): RTE<string> =>
  (ctx) => {
    return pipe(
      mimeType,
      fp.RTE.fromPredicate(
        (t): t is TransferableMediaType =>
          Schema.is(Schema.Union(ImageType, PDFType))(t),
        () =>
          toWorkerError(
            new Error(`Can't transfer this media type: ${mimeType}`),
          ),
      ),
      fp.RTE.chain((mType) =>
        pipe(
          ctx.http.get<Stream.Readable>(url, {
            responseType: "stream",
          }),
          fp.TE.mapLeft(toWorkerError),
          fp.RTE.fromTaskEither,
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
      fp.RTE.map((r) => r.Location),
    )(ctx);
  };
