import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EVENTS } from "@liexp/shared/lib/io/http/Events/index.js";
import { Queue } from "@liexp/shared/lib/io/http/index.js";
import { type Document } from "langchain/document";
import { type ClientContextRTE } from "../../types.js";
import { loadLink } from "./loadLink.flow.js";
import { loadPDF } from "./loadPDF.flow.js";
import { loadText } from "./loadText.flow.js";
import { toAIBotError } from "#common/error/index.js";

const loadEventDocs =
  (job: Queue.Queue): ClientContextRTE<Document[]> =>
  (ctx) => {
    return pipe(
      ctx.endpointsRESTClient.Endpoints.Event.get({ id: job.id }),
      fp.RTE.fromTaskEither,
      fp.RTE.map((event) => event.links),
      fp.RTE.chain((links) =>
        pipe(links, fp.A.traverse(fp.RTE.ApplicativePar)(loadLink)),
      ),
      fp.RTE.map(fp.A.flatten),
    )(ctx);
  };

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

  if (job.resource === EVENTS.value) {
    return loadEventDocs(job);
  }

  return fp.RTE.left(toAIBotError(new Error("Invalid job data")));
};
