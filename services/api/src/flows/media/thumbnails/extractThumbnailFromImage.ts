import { pipe } from "@liexp/core/lib/fp/index.js";
import { type ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { type ExtractThumbnailFromMediaFlow } from "./ExtractThumbnailFlow.type.js";
import { fetchFromRemote } from "./fetchFromRemote.flow.js";

export type SimpleImageMedia = SimpleMedia<ImageType>;

export const extractThumbnailFromImage: ExtractThumbnailFromMediaFlow<
  SimpleImageMedia
> = (ctx) => (media) => {
  return pipe(
    fetchFromRemote(ctx)(media.location),
    TE.map((screenshotBuffer) => {
      return [new Uint8Array(screenshotBuffer).buffer];
    }),
  );
};
