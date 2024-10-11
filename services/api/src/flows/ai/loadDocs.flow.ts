import { fp } from "@liexp/core/lib/fp/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type Document } from "langchain/document";
import { loadLink } from "./loadLink.flow.js";
import { loadPDF } from "./loadPDF.flow.js";
import { loadText } from "./loadText.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { ServerError } from "#io/ControllerError.js";

export const loadDocs = (job: Queue.Queue): TEReader<Document[]> => {
  if (job.data.text) {
    return loadText(job.data.text);
  }

  if (job.data.url) {
    if (job.resource === "media") {
      return loadPDF(job.data.url);
    }

    return loadLink(job.data.url);
  }

  return fp.RTE.left(ServerError(["Invalid job data"]));
};
