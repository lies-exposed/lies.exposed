import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  PDFType,
  ImageType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import axios from "axios";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { type TEFlow } from "#flows/flow.types.js";
import {
  toControllerError,
  type ControllerError,
  ServerError,
} from "#io/ControllerError.js";

type TransferableMediaType = ImageType | PDFType;
export const transferFromExternalProvider: TEFlow<
  [UUID, string, string, MediaType],
  string
> =
  (ctx) =>
  (
    mediaId,
    url,
    fileName,
    mimeType,
  ): TE.TaskEither<ControllerError, string> => {
    return pipe(
      mimeType,
      TE.fromPredicate(
        (t): t is TransferableMediaType => ImageType.is(t) || PDFType.is(t),
        () => ServerError(),
      ),
      TE.chain((mType) =>
        pipe(
          TE.tryCatch(
            () =>
              axios.get(url, {
                responseType: "stream",
              }),
            toControllerError,
          ),
          TE.chain((stream) => {
            return ctx.s3.upload({
              Key: getMediaKey("media", mediaId, fileName, mType),
              Body: stream.data,
              ACL: "public-read",
              Bucket: ctx.env.SPACE_BUCKET,
              ContentType: mimeType,
            });
          }),
        ),
      ),
      TE.map((r) => r.Location),
      TE.filterOrElse(t.string.is, () => toControllerError(new Error())),
    );
  };
