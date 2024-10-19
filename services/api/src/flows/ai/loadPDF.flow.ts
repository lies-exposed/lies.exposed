import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { fetchPDF } from "@liexp/backend/lib/flows/media/fetchPDF.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const loadPDF = (url: string): TEReader<Document[]> => {
  return pipe(
    fetchPDF(url),
    fp.RTE.chainTaskEitherK((pdf) =>
      fp.TE.tryCatch(async () => {
        const pdfData = await pdf.getData();
        const loader = new PDFLoader(new Blob([pdfData]));
        const docs = await loader.load();
        return docs;
      }, toControllerError),
    ),
  );
};
