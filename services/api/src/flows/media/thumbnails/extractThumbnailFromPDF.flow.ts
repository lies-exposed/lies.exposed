import { fetchPDF } from "@liexp/backend/lib/flows/media/fetchPDF.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ImageType,
  type PDFType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import * as Canvas from "canvas";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type RenderParameters } from "pdfjs-dist/types/src/display/api.js";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { type ExtractThumbnailFromMediaFlow } from "./ExtractThumbnailFlow.type.js";
import { type ServerContext } from "#context/context.type.js";
import { toControllerError } from "#io/ControllerError.js";

export const extractThumbnailFromPDF: ExtractThumbnailFromMediaFlow<
  SimpleMedia<PDFType>
> = (media) => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
    fp.RTE.flatMapTaskEither(fetchPDF(media.location)),
    fp.RTE.chainTaskEitherK((pdf) =>
      TE.tryCatch(() => pdf.getPage(1), toControllerError),
    ),
    fp.RTE.chainTaskEitherK((page) => {
      return pipe(
        TE.tryCatch(async () => {
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          const outputScale = 1;

          const canvas = Canvas.createCanvas(viewport.width, viewport.height);
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
          return canvas.toBuffer(ImageType.types[2].value);
        }, toControllerError),

        TE.chainFirst(() => TE.fromIO(() => page.cleanup())),
      );
    }),
    fp.RTE.map((screenshotBuffer) => {
      return [new Uint8Array(screenshotBuffer).buffer];
    }),
  );
};
