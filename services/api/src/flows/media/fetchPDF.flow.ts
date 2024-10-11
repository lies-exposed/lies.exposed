import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const fetchPDF =
  (location: string): TEReader<PDFDocumentProxy> =>
  (ctx) => {
    return pipe(
      ctx.http.get<ArrayBuffer>(location, {
        responseType: "arraybuffer",
      }),
      TE.mapLeft(toControllerError),
      TE.chain((pdfStream) => ctx.pdf.getDocument(new Uint16Array(pdfStream))),
    );
  };
