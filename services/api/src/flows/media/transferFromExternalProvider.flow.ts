import { type ImageType } from "@liexp/shared/lib/io/http/Media";
import {
  getMediaKey
} from "@liexp/shared/lib/utils/media.utils";
import axios from "axios";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { type UUID } from "io-ts-types/lib/UUID";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError, type ControllerError } from "@io/ControllerError";

export const transferFromExternalProvider: TEFlow<
  [UUID, string, string, ImageType],
  string
> =
  (ctx) =>
  (
    mediaId,
    url,
    fileName,
    mimeType
  ): TE.TaskEither<ControllerError, string> => {
    return pipe(
      TE.tryCatch(
        () =>
          axios.get(url, {
            responseType: "stream",
          }),
        toControllerError
      ),
      TE.chain((stream) => {
        return ctx.s3.upload({
          Key: getMediaKey("media", mediaId, fileName, mimeType),
          Body: stream.data,
          ACL: "public-read",
          Bucket: ctx.env.SPACE_BUCKET,
          ContentType: mimeType,
        });
      }),
      TE.map((r) => r.Location),
      TE.filterOrElse(t.string.is, () => toControllerError(new Error()))
    );
  };
