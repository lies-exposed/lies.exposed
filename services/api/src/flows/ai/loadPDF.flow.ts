import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document.js";
import { type TEFlow } from "#flows/flow.types.js";
import { fetchPDF } from "#flows/media/fetchPDF.flow.js";
import { toControllerError } from "#io/ControllerError.js";

export const loadPDF: TEFlow<[string], Document[]> = (ctx) => (url) => {
  ctx.logger.debug.log("Querying pdf from URL %s", url);
  return pipe(
    fetchPDF(ctx)(url),
    fp.TE.chain((pdf) =>
      fp.TE.tryCatch(async () => {
        const pdfData = await pdf.getData();
        const loader = new PDFLoader(new Blob([pdfData]));
        const docs = await loader.load();
        return docs;
      }, toControllerError),
    ),
  );
};
