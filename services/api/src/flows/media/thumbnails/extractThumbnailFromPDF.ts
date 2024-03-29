import { pipe } from "@liexp/core/lib/fp/index.js";
import { ImageType, type PDFType } from "@liexp/shared/lib/io/http/Media.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import * as Canvas from "canvas";
import * as TE from "fp-ts/lib/TaskEither.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { type RenderParameters } from "pdfjs-dist/types/src/display/api.js";
import { type ExtractThumbnailFlow } from "./ExtractThumbnailFlow.type.js";
import { toControllerError } from "#io/ControllerError.js";

export const extractThumbnailFromPDF: ExtractThumbnailFlow<PDFType> =
  (ctx) => (media) => {
    return pipe(
      ctx.http.get<ArrayBuffer>(media.location, {
        responseType: "arraybuffer",
      }),
      TE.mapLeft(toControllerError),
      TE.chain((pdfStream) =>
        TE.tryCatch(async () => {
          const pdf = await getDocument({
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
          ACL: "public-read" as const,
        };
      }),
      TE.map((s) => [s]),
    );
  };
