import { fp } from "@liexp/core/lib/fp";
import { Media } from "@liexp/shared/lib/io/http";
import { type MediaType } from "@liexp/shared/lib/io/http/Media";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type ExtractThumbnailFlow } from "./ExtractThumbnailFlow.type";
import { extractMP4Thumbnail } from "./extractMP4Thumbnail";
import { extractThumbnailFromPDF } from "./extractThumbnailFromPDF";
import {
  createFromRemote,
  extractThumbnailFromIframe,
} from "./extractThumbnailFromVideoPlatform";

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
      return pipe(
        createFromRemote(ctx)(m.id, m.location, type),
        TE.map(fp.A.of),
      );
    }

    if (Media.AudioType.is(type)) {
      return TE.right([]);
    }

    return extractThumbnailFromIframe(ctx)({ ...m, type });
  };
