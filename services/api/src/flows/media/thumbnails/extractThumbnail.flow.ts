import { type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ImageType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaThumbKey } from "@liexp/shared/lib/utils/media.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { extractMP4Thumbnail } from "./extractMP4Thumbnail.flow.js";
import { extractThumbnailFromImage } from "./extractThumbnailFromImage.flow.js";
import { extractThumbnailFromPDF } from "./extractThumbnailFromPDF.flow.js";
import { extractThumbnailFromIframe } from "./extractThumbnailFromVideoPlatform.js";
import { resizeThumbnailFlow } from "./thumbnailResize.flow.js";
import { type TEReader } from "#flows/flow.types.js";

export type ExtractThumbnailFlow<T extends MediaType> = (
  media: SimpleMedia<T>,
) => TEReader<PutObjectCommandInput[]>;

export const extractThumbnail: ExtractThumbnailFlow<MediaType> =
  (media) => (ctx) => {
    ctx.logger.debug.log(
      "Extracting thumbnail from url %s with type %s",
      media.location,
      media.type,
    );

    return pipe(
      TE.Do,
      TE.bind("thumbnails", () => {
        const { type, ...m } = media;

        if (Media.PDFType.is(type)) {
          return extractThumbnailFromPDF({
            ...m,
            type,
          })(ctx);
        }

        if (Media.MP4Type.is(type)) {
          return extractMP4Thumbnail({
            ...m,
            type,
          })(ctx);
        }

        if (Media.ImageType.is(type)) {
          return extractThumbnailFromImage({
            ...m,
            type,
          })(ctx);
        }

        if (Media.AudioType.is(type)) {
          return TE.right([]);
        }

        return extractThumbnailFromIframe({
          ...m,
          type,
        })(ctx);
      }),
      TE.bind("resizedThumbnail", ({ thumbnails }) => {
        return pipe(
          thumbnails,
          fp.A.traverse(fp.TE.ApplicativePar)((t) =>
            resizeThumbnailFlow(t)(ctx),
          ),
        );
      }),
      TE.map(({ resizedThumbnail }) => {
        return resizedThumbnail.map((Body, index) => ({
          Key: getMediaThumbKey(media.id, ImageType.types[2].value, index + 1),
          Body,
          ACL: "public-read",
          Bucket: ctx.env.SPACE_BUCKET,
        }));
      }),
    );
  };
