import { type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ImageType, type MediaType } from "@liexp/shared/lib/io/http/Media.js";
import { Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaThumbKey } from "@liexp/shared/lib/utils/media.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { extractMP4Thumbnail } from "./extractMP4Thumbnail.flow.js";
import { extractThumbnailFromImage } from "./extractThumbnailFromImage.js";
import { extractThumbnailFromPDF } from "./extractThumbnailFromPDF.flow.js";
import { extractThumbnailFromIframe } from "./extractThumbnailFromVideoPlatform.js";
import { resizeThumbnailFlow } from "./thumbnailResize.flow.js";
import { type TEFlow } from "#flows/flow.types.js";

export type ExtractThumbnailFlow<T> = TEFlow<
  [Pick<Media.Media, "id" | "location"> & { type: T }],
  PutObjectCommandInput[]
>;

export const extractThumbnail: ExtractThumbnailFlow<MediaType> =
  (ctx) => (media) => {
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
          return extractThumbnailFromPDF(ctx)({ ...m, type });
        }

        if (Media.MP4Type.is(type)) {
          return extractMP4Thumbnail(ctx)({ ...m, type });
        }

        if (Media.ImageType.is(type)) {
          return extractThumbnailFromImage(ctx)({ ...m, type });
        }

        if (Media.AudioType.is(type)) {
          return TE.right([]);
        }

        return extractThumbnailFromIframe(ctx)({ ...m, type });
      }),
      TE.bind("resizedThumbnail", ({ thumbnails }) => {
        return pipe(
          thumbnails,
          fp.A.traverse(fp.TE.ApplicativePar)((thumbnail) =>
            resizeThumbnailFlow(ctx)(thumbnail),
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
