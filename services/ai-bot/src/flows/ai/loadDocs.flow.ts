import { fp } from "@liexp/core/lib/fp/index.js";
import { toAPIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { Queue } from "@liexp/shared/lib/io/http/index.js";
import { type Document } from "langchain/document";
import { type ClientContextRTE } from "../types.js";
import { loadLink } from "./loadLink.flow.js";
import { loadPDF } from "./loadPDF.flow.js";
import { loadText } from "./loadText.flow.js";

export const loadDocs = (job: Queue.Queue): ClientContextRTE<Document[]> => {
  if (Queue.CreateQueueTextData.is(job.data)) {
    return loadText(job.data.text);
  }

  if (job.data.url) {
    if (job.resource === "media") {
      return loadPDF(job.data.url);
    }

    return loadLink(job.data.url);
  }

  return fp.RTE.left(toAPIError(new Error("Invalid job data")));
};
