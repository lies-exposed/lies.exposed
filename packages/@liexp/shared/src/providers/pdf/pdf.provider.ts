import * as TE from "fp-ts/lib/TaskEither.js";
import type * as pdf from "pdfjs-dist/legacy/build/pdf.mjs";
import type {
  PDFDocumentProxy,
  TextItem,
} from "pdfjs-dist/types/src/display/api.js";
import { IOError } from "ts-io-error";

export class PDFError extends IOError {
  name = "PDFError";
}

export type { PDFDocumentProxy };

const toError = (e: any): IOError => {
  if (e instanceof IOError) {
    return e;
  }

  if (e instanceof Error) {
    return new PDFError(e.message, {
      kind: "ServerError",
      status: "500",
      meta: e.stack,
    });
  }

  return new PDFError(e, {
    kind: "ServerError",
    status: "500",
    meta: e.stack,
  });
};

interface PDFProviderContext {
  client: typeof pdf;
  cMapUrl?: string;
  cMapPacked?: boolean;
  standardFontDataUrl?: string;
}

export interface PDFProvider {
  getDocument: (data: Uint16Array) => TE.TaskEither<PDFError, PDFDocumentProxy>;
  getAllTextContents: (
    pdf: PDFDocumentProxy,
  ) => TE.TaskEither<PDFError, string>;
}

export const PDFProvider = (ctx: PDFProviderContext): PDFProvider => {
  return {
    getDocument: (data) =>
      TE.tryCatch(() => {
        return ctx.client.getDocument({
          data,
          cMapUrl: ctx.cMapUrl,
          cMapPacked: ctx.cMapPacked,
          standardFontDataUrl: ctx.standardFontDataUrl,
        }).promise;
      }, toError),
    getAllTextContents(pdf) {
      return TE.tryCatch(async () => {
        const pageList = await Promise.all(
          Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1)),
        );

        const textList = await Promise.all(
          pageList.map((p) => p.getTextContent()),
        );

        return textList
          .map(({ items }) =>
            items
              .filter((t): t is TextItem => !!(t as any).str)
              .map((str) => str.str)
              .join(""),
          )
          .join("");
      }, toError);
    },
  };
};
