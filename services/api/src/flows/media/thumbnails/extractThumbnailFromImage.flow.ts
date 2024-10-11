import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { type ExtractThumbnailFromMediaFlow } from "./ExtractThumbnailFlow.type.js";
import { fetchFromRemote } from "./fetchFromRemote.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export type SimpleImageMedia = SimpleMedia<ImageType>;

export const extractThumbnailFromImage: ExtractThumbnailFromMediaFlow<
  SimpleImageMedia
> = (media) => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chainTaskEitherK(fetchFromRemote(media.location)),
    fp.RTE.map((screenshotBuffer) => {
      return [new Uint8Array(screenshotBuffer).buffer];
    }),
  );
};
