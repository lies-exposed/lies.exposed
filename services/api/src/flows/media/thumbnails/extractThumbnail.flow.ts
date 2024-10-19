import { type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ImageType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaThumbKey } from "@liexp/shared/lib/utils/media.utils.js";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { extractMP4Thumbnail } from "./extractMP4Thumbnail.flow.js";
import { extractThumbnailFromImage } from "./extractThumbnailFromImage.flow.js";
import { extractThumbnailFromPDF } from "./extractThumbnailFromPDF.flow.js";
import { extractThumbnailFromIframe } from "./extractThumbnailFromVideoPlatform.js";
import { resizeThumbnailFlow } from "./thumbnailResize.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { type RouteContext } from "#routes/route.types.js";

export type ExtractThumbnailFlow<T extends MediaType> = (
  media: SimpleMedia<T>,
) => TEReader<PutObjectCommandInput[]>;

export const extractThumbnail: ExtractThumbnailFlow<MediaType> = (media) => {
  return pipe(
    fp.RTE.of(media),
    LoggerService.RTE.debug((m) => [
      "Extracting thumbnail from url %s with type %s",
      m.location,
      m.type,
    ]),
    fp.RTE.bind("bucket", () =>
      fp.RTE.asks((ctx: RouteContext) => ctx.env.SPACE_BUCKET),
    ),
    fp.RTE.bind("thumbnails", (): TEReader<ArrayBuffer[]> => {
      const { type, ...m } = media;

      if (Media.PDFType.is(type)) {
        return extractThumbnailFromPDF({
          ...m,
          type,
        });
      }

      if (Media.MP4Type.is(type)) {
        return extractMP4Thumbnail({
          ...m,
          type,
        });
      }

      if (Media.ImageType.is(type)) {
        return extractThumbnailFromImage({
          ...m,
          type,
        });
      }

      if (Media.AudioType.is(type)) {
        return fp.RTE.right([]);
      }

      return extractThumbnailFromIframe({
        ...m,
        type,
      });
    }),
    fp.RTE.bind("resizedThumbnail", ({ thumbnails }) => {
      return pipe(
        thumbnails,
        fp.A.traverse(fp.RTE.ApplicativePar)(resizeThumbnailFlow),
      );
    }),
    fp.RTE.map(({ resizedThumbnail, bucket }) => {
      return resizedThumbnail.map((Body, index) => ({
        Key: getMediaThumbKey(media.id, ImageType.types[2].value, index + 1),
        Body,
        ACL: "public-read",
        Bucket: bucket,
      }));
    }),
  );
};
