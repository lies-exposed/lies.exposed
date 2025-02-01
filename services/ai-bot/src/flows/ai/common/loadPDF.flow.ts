import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { fetchPDF } from "@liexp/backend/lib/flows/media/fetchPDF.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContextRTE } from "../../../types.js";

export const loadPDF = (url: string): ClientContextRTE<Document[]> => {
  return pipe(
    fetchPDF(url),
    fp.RTE.chainTaskEitherK((pdf) =>
      fp.TE.tryCatch(async () => {
        const pdfData = await pdf.getData();
        const loader = new PDFLoader(new Blob([pdfData]), {
          // it gets embedded as one document per file
          splitPages: false,
        });
        const docs = await loader.load();
        return docs;
      }, toAIBotError),
    ),
  );
};
