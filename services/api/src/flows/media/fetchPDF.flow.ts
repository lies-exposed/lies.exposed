import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/TaskEither";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api.js";
import { TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const fetchPDF: TEFlow<[string], PDFDocumentProxy> =
  (ctx) => (location) => {
    return pipe(
      ctx.http.get<ArrayBuffer>(location, {
        responseType: "arraybuffer",
      }),
      TE.mapLeft(toControllerError),
      TE.chain((pdfStream) => ctx.pdf.getDocument(new Uint16Array(pdfStream))),
    );
  };
