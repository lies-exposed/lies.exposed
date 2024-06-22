import { type MediaType } from "@liexp/shared/lib/io/http/Media.js";
import { Media } from "@liexp/shared/lib/io/http/index.js";
import * as TE from "fp-ts/TaskEither";
import { type ExtractThumbnailFlow } from "./ExtractThumbnailFlow.type.js";
import { extractMP4Thumbnail } from "./extractMP4Thumbnail.flow.js";
import { extractThumbnailFromImage } from "./extractThumbnailFromImage.js";
import { extractThumbnailFromPDF } from "./extractThumbnailFromPDF.flow.js";
import { extractThumbnailFromIframe } from "./extractThumbnailFromVideoPlatform.js";

export const extractThumbnail: ExtractThumbnailFlow<MediaType> =
  (ctx) => (media) => {
    ctx.logger.debug.log(
      "Extracting thumbnail from url %s with type %s",
      media.location,
      media.type,
    );
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
  };
