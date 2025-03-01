import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EVENTS } from "@liexp/shared/lib/io/http/Events/index.js";
import { CreateEventFromTextQueueData } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromTextQueueData.js";
import { CreateEventFromURLQueueData } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromURLQueue.js";
import {
  CreateQueueTextData,
  CreateQueueURLData,
  type Queue,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { type Document } from "langchain/document";
import { type ClientContextRTE } from "../../../types.js";
import { loadLink } from "./loadLink.flow.js";
import { loadPDF } from "./loadPDF.flow.js";
import { loadText } from "./loadText.flow.js";
import { toAIBotError } from "#common/error/index.js";

const loadEventDocs =
  (job: Queue): ClientContextRTE<Document[]> =>
  (ctx) => {
    return pipe(
      ctx.endpointsRESTClient.Endpoints.Event.get({ id: job.id }),
      fp.RTE.fromTaskEither,
      fp.RTE.chainTaskEitherK((event) =>
        ctx.endpointsRESTClient.Endpoints.Link.getList({
          filter: { ids: event.links },
        }),
      ),
      fp.RTE.chain((links) =>
        pipe(
          links.data,
          fp.A.traverse(fp.RTE.ApplicativePar)((l) => loadLink(l.url)),
        ),
      ),
      fp.RTE.map(fp.A.flatten),
    )(ctx);
  };

export const loadDocs = (job: Queue): ClientContextRTE<Document[]> => {
  switch (true) {
    case CreateQueueTextData.is(job.data):
    case CreateEventFromTextQueueData.is(job.data): {
      return loadText(job.data.text);
    }
    case CreateEventFromURLQueueData.is(job.data):
    case CreateQueueURLData.is(job.data): {
      if (job.resource === "media") {
        return loadPDF(job.data.url);
      }

      return loadLink(job.data.url);
    }
    case job.resource === EVENTS.value: {
      return loadEventDocs(job);
    }
    default: {
      return fp.RTE.left(toAIBotError(new Error("Invalid job data")));
    }
  }
};
