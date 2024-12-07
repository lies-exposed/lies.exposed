import { pipe } from "@liexp/core/lib/fp/index.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import {
  type PDFError,
  type PDFDocumentProxy,
} from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type PDFProviderContext } from "../../context/pdf.context.js";

export const fetchPDF =
  <C extends PDFProviderContext & HTTPProviderContext>(
    location: string,
  ): ReaderTaskEither<C, PDFError | HTTPError, PDFDocumentProxy> =>
  (ctx) => {
    return pipe(
      ctx.http.get<ArrayBuffer>(location, {
        responseType: "arraybuffer",
      }),
      TE.chainW((pdfStream) => ctx.pdf.getDocument(new Uint16Array(pdfStream))),
    );
  };
