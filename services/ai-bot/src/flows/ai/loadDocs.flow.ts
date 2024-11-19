import { fp } from "@liexp/core/lib/fp/index.js";
import { Queue } from "@liexp/shared/lib/io/http/index.js";
import { type Document } from "langchain/document";
import { type ClientContextRTE } from "../../types.js";
import { loadLink } from "./loadLink.flow.js";
import { loadPDF } from "./loadPDF.flow.js";
import { loadText } from "./loadText.flow.js";
import { toAIBotError } from "#common/error/index.js";

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

  return fp.RTE.left(toAIBotError(new Error("Invalid job data")));
};
