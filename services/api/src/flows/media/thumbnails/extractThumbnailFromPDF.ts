import { ImageType, type PDFType } from "@liexp/shared/lib/io/http/Media";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils";
import * as Canvas from "canvas";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as pdfJS from "pdfjs-dist/legacy/build/pdf";
import { type RenderParameters } from "pdfjs-dist/types/src/display/api";
import { type ExtractThumbnailFlow } from "./ExtractThumbnailFlow.type";
import { toControllerError } from "@io/ControllerError";

export const extractThumbnailFromPDF: ExtractThumbnailFlow<PDFType> =
  (ctx) => (media) => {
    return pipe(
      ctx.http.get<ArrayBuffer>(media.location, {
        responseType: "arraybuffer",
      }),
      TE.mapLeft(toControllerError),
      TE.chain((pdfStream) =>
        TE.tryCatch(async () => {
          const pdf = await pdfJS.getDocument({
            data: new Uint16Array(pdfStream),
          }).promise;

          const page = await pdf.getPage(1);
          return page;
        }, toControllerError),
      ),
      TE.chain((page) => {
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
      TE.map((screenshotBuffer) => {
        const thumbnailName = `${media.id}-thumbnail`;

        const key = getMediaKey(
          "media",
          media.id,
          thumbnailName,
          ImageType.types[2].value,
        );

        return {
          Key: key,
          Body: screenshotBuffer,
          ContentType: ImageType.types[2].value,
          Bucket: ctx.env.SPACE_BUCKET,
          ACL: "public-read",
        };
      }),
      TE.map((s) => [s]),
    );
  };
