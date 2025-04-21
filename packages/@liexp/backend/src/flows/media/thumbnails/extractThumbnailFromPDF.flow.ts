import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ImageType,
  type PDFType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { createCanvas } from "@napi-rs/canvas";
import * as TE from "fp-ts/lib/TaskEither.js";
import {
  type PDFPageProxy,
  type RenderParameters,
} from "pdfjs-dist/types/src/display/api.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type PDFProviderContext } from "../../../context/pdf.context.js";
import { ServerError } from "../../../errors/ServerError.js";
import { type SimpleMedia } from "../../../io/media.io.js";
import { fetchPDF } from "../fetchPDF.flow.js";
import { type ExtractThumbnailFromRTE } from "./ExtractThumbnailFlow.type.js";

export const extractThumbnailFromPDFPage = (
  page: PDFPageProxy,
): TE.TaskEither<ServerError, Buffer<ArrayBufferLike>> => {
  return pipe(
    TE.tryCatch(
      async () => {
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const outputScale = 1;

        const canvas = createCanvas(viewport.width, viewport.height);

        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const transform =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;

        const renderContext: RenderParameters = {
          canvasContext: context as any,
          transform,
          viewport,
        };

        await page.render(renderContext).promise;

        return canvas.toBuffer(ImageType.members[2].literals[0]);
      },
      (e) => ServerError.fromUnknown(e),
    ),
    TE.chainFirst(() => TE.fromIO(() => page.cleanup())),
  );
};

export const extractThumbnailFromPDF = <
  C extends HTTPProviderContext & PDFProviderContext,
>(
  media: SimpleMedia<PDFType>,
): ExtractThumbnailFromRTE<C> => {
  return pipe(
    fp.RTE.ask<C>(),
    fp.RTE.flatMapTaskEither(fetchPDF(media.location)),
    fp.RTE.chainTaskEitherK((pdf) =>
      pipe(
        pdf.numPages,
        (p) => [1, p / 2, p].map(Math.floor),
        fp.A.uniq(fp.N.Eq),
        fp.A.traverse(fp.TE.ApplicativePar)((page) =>
          pipe(
            fp.TE.tryCatch(() => pdf.getPage(page), ServerError.fromUnknown),
            fp.TE.chain(extractThumbnailFromPDFPage),
          ),
        ),
      ),
    ),
    fp.RTE.map((screenshotBuffer) => {
      return screenshotBuffer.map((b) => new Uint8Array(b).buffer);
    }),
  );
};
