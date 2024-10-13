import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  ImageType,
  PDFType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import axios from "axios";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEReader } from "#flows/flow.types.js";
import { upload } from "#flows/space/upload.flow.js";
import { toControllerError } from "#io/ControllerError.js";

type TransferableMediaType = ImageType | PDFType;
export const transferFromExternalProvider = (
  mediaId: UUID,
  url: string,
  fileName: string,
  mimeType: MediaType,
): TEReader<string> => {
  return pipe(
    mimeType,
    fp.RTE.fromPredicate(
      (t): t is TransferableMediaType => ImageType.is(t) || PDFType.is(t),
      () =>
        toControllerError(
          new Error(`Can't transfer this media type: ${mimeType}`),
        ),
    ),
    fp.RTE.chain((mType) =>
      pipe(
        TE.tryCatch(
          () =>
            axios.get(url, {
              responseType: "stream",
            }),
          toControllerError,
        ),
        fp.RTE.fromTaskEither,
        fp.RTE.chain((stream) => {
          return upload({
            Key: getMediaKey("media", mediaId, fileName, mType),
            Body: stream.data,
            ACL: "public-read",
            ContentType: mimeType,
          });
        }),
      ),
    ),
    fp.RTE.map((r) => r.Location),
  );
};
