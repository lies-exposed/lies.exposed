import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { ServerError } from "../../../errors/ServerError.js";
import { type SimpleMedia } from "../../../io/media.io.js";
import { fetchAsBuffer } from "../../url/fetchAsBuffer.flow.js";
import { type ExtractThumbnailFromRTE } from "./ExtractThumbnailFlow.type.js";

export type SimpleImageMedia = SimpleMedia<ImageType>;

export const extractThumbnailFromImage = <C extends HTTPProviderContext>(
  media: SimpleImageMedia,
): ExtractThumbnailFromRTE<C> => {
  return pipe(
    fp.RTE.ask<C, ServerError>(),
    fp.RTE.chainTaskEitherK(fetchAsBuffer(media.location)),
    fp.RTE.mapLeft(ServerError.fromUnknown),
    fp.RTE.map((screenshotBuffer) => {
      return [new Uint8Array(screenshotBuffer).buffer];
    }),
  );
};
