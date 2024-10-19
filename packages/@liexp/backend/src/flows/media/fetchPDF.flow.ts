import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type APIError,
  toAPIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type PDFError } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api.js";
import {
  type HTTPProviderContext,
  type PDFProviderContext,
} from "../../context/index.js";

export const fetchPDF =
  <C extends PDFProviderContext & HTTPProviderContext>(
    location: string,
  ): ReaderTaskEither<C, PDFError | APIError, PDFDocumentProxy> =>
  (ctx) => {
    return pipe(
      ctx.http.get<ArrayBuffer>(location, {
        responseType: "arraybuffer",
      }),
      TE.mapLeft(toAPIError),
      TE.chainW((pdfStream) => ctx.pdf.getDocument(new Uint16Array(pdfStream))),
    );
  };
