import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ImageType,
  type MediaExtra,
  MP4Type,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ConfigContext } from "../../../context/config.context.js";
import { type ENVContext } from "../../../context/env.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import {
  type ImgProcClientContext,
  type FFMPEGProviderContext,
} from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type SpaceContext } from "../../../context/space.context.js";
import { type MediaEntity } from "../../../entities/Media.entity.js";
import { type ServerError } from "../../../errors/ServerError.js";
import { type SimpleMP4Media } from "../thumbnails/extractMP4Thumbnail.flow.js";
import { type SimpleImageMedia } from "../thumbnails/extractThumbnailFromImage.flow.js";
import { extractImageTypeExtra } from "./extractImageTypeExtra.flow.js";
import { extractMP4Extra } from "./extractMP4Extra.js";
import { extractThumbnailsExtra } from "./extractThumbnailsExtra.flow.js";

export const extractMediaExtra = <
  C extends FFMPEGProviderContext &
    ConfigContext &
    HTTPProviderContext &
    ImgProcClientContext &
    LoggerContext &
    FSClientContext &
    SpaceContext &
    ENVContext,
>(
  media: MediaEntity,
): ReaderTaskEither<C, ServerError, MediaExtra | undefined> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("media", () => fp.RTE.of(media)),
    fp.RTE.bind("mediaExtra", ({ media }) => {
      if (ImageType.is(media.type)) {
        return extractImageTypeExtra<C>(media as SimpleImageMedia);
      }
      if (MP4Type.is(media.type)) {
        return extractMP4Extra<C>(media as SimpleMP4Media);
      }

      return fp.RTE.right<C, ServerError, MediaExtra | undefined>(
        media.extra ?? undefined,
      );
    }),
    fp.RTE.bind("thumbnailExtra", ({ media }) => {
      if (media.thumbnail) {
        return extractThumbnailsExtra<C>(media.thumbnail);
      }
      return fp.RTE.right(media.extra ?? ThumbnailsExtraMonoid.empty);
    }),
    fp.RTE.bind("extra", ({ mediaExtra, thumbnailExtra }) =>
      fp.RTE.right({
        width: 0,
        height: 0,
        ...mediaExtra,
        ...thumbnailExtra,
      }),
    ),
    fp.RTE.map(({ extra }) => extra),
  );
};
