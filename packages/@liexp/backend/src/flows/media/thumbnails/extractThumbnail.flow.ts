import { type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaThumbKey } from "@liexp/shared/lib/utils/media.utils.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ConfigContext } from "../../../context/config.context.js";
import { type ENVContext } from "../../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type ImgProcClientContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type PDFProviderContext } from "../../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../../context/puppeteer.context.js";
import { type ServerError } from "../../../errors/ServerError.js";
import { type SimpleMedia } from "../../../io/media.io.js";
import { LoggerService } from "../../../services/logger/logger.service.js";
import { extractMP4Thumbnail } from "./extractMP4Thumbnail.flow.js";
import { extractThumbnailFromImage } from "./extractThumbnailFromImage.flow.js";
import { extractThumbnailFromPDF } from "./extractThumbnailFromPDF.flow.js";
import { extractThumbnailFromIframe } from "./extractThumbnailFromVideoPlatform.flow.js";
import { resizeThumbnailFlow } from "./thumbnailResize.flow.js";

export const extractThumbnail = <
  C extends LoggerContext &
    ENVContext &
    ConfigContext &
    FSClientContext &
    HTTPProviderContext &
    PDFProviderContext &
    FFMPEGProviderContext &
    PuppeteerProviderContext &
    ImgProcClientContext,
>(
  media: SimpleMedia,
): ReaderTaskEither<C, ServerError, PutObjectCommandInput[]> => {
  return pipe(
    fp.RTE.right<C, ServerError, SimpleMedia>(media),
    LoggerService.RTE.debug((m) => [
      "Extracting thumbnail from url %s with type %s",
      m.location,
      m.type,
    ]),
    fp.RTE.bind("bucket", () => fp.RTE.asks((ctx: C) => ctx.env.SPACE_BUCKET)),
    fp.RTE.bind(
      "thumbnails",
      (): ReaderTaskEither<C, ServerError, readonly ArrayBuffer[]> => {
        const { type, ...m } = media;

        if (Schema.is(Media.PDFType)(type)) {
          return extractThumbnailFromPDF({
            ...m,
            type,
          });
        }

        if (Schema.is(Media.MP4Type)(type)) {
          return extractMP4Thumbnail({
            ...m,
            type,
          });
        }

        if (Schema.is(Media.ImageType)(type)) {
          return extractThumbnailFromImage({
            ...m,
            type,
          });
        }

        if (Schema.is(Media.AudioType)(type)) {
          return fp.RTE.right([]);
        }

        return extractThumbnailFromIframe({
          ...m,
          type,
        });
      },
    ),
    fp.RTE.bind("resizedThumbnail", ({ thumbnails }) => {
      return pipe(
        thumbnails,
        fp.A.traverse(fp.RTE.ApplicativePar)(resizeThumbnailFlow<C>),
      );
    }),
    fp.RTE.map(({ resizedThumbnail, bucket }) => {
      return resizedThumbnail.map((Body, index) => ({
        Key: getMediaThumbKey(media.id, ImageType.members[2].Type, index + 1),
        Body,
        ACL: "public-read",
        Bucket: bucket,
      }));
    }),
  );
};
