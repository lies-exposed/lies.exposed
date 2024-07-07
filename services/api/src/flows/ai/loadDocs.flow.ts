import { fp } from "@liexp/core/lib/fp/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type Document } from "langchain/document.js";
import { loadLink } from "./loadLink.flow.js";
import { loadPDF } from "./loadPDF.flow.js";
import { loadText } from "./loadText.flow.js";
import { type TEFlow } from "#flows/flow.types.js";
import { ServerError } from "#io/ControllerError.js";

export const loadDocs: TEFlow<[Queue.Queue], Document[]> = (ctx) => (job) => {
  ctx.logger.debug.log("Querying docs from job %O", job);

  if (job.data.text) {
    return loadText(ctx)(job.data.text);
  }

  if (job.data.url) {
    if (job.resource === "media") {
      return loadPDF(ctx)(job.data.url);
    }

    return loadLink(ctx)(job.data.url);
  }

  return fp.TE.left(ServerError(["Invalid job data"]));
};
