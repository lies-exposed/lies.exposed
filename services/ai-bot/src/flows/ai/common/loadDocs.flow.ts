import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EVENTS } from "@liexp/shared/lib/io/http/Events/index.js";
import { MEDIA } from "@liexp/shared/lib/io/http/Media/Media.js";
import { CreateEventFromTextQueueData } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromTextQueueData.js";
import { CreateEventFromURLQueueData } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromURLQueue.js";
import { UpdateEventQueueData } from "@liexp/shared/lib/io/http/Queue/event/UpdateEventQueue.js";
import {
  CreateQueueTextData,
  CreateQueueURLData,
  type Queue,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { Schema } from "effect";
import * as A from "fp-ts/lib/Array.js";
import { type Document } from "langchain/document";
import { type ClientContextRTE } from "../../../types.js";
import { loadLinkWithPuppeteer } from "./loadLinkWithPuppeteer.flow.js";
import { loadPDF } from "./loadPDF.flow.js";
import { loadText } from "./loadText.flow.js";
import { toAIBotError } from "#common/error/index.js";

const loadEventDocs =
  (job: Queue): ClientContextRTE<Document[]> =>
  (ctx) => {
    return pipe(
      ctx.api.Event.Get({ Params: { id: job.id } }),
      fp.RTE.fromTaskEither,
      fp.RTE.chainTaskEitherK((event) =>
        ctx.api.Link.List({
          Query: { ids: event.data.links },
        }),
      ),
      fp.RTE.chain((links) =>
        pipe(
          [...links.data],
          A.traverse(fp.RTE.ApplicativePar)((l) =>
            loadLinkWithPuppeteer(l.url),
          ),
        ),
      ),
      fp.RTE.map(A.flatten),
    )(ctx);
  };

export const loadDocs = (job: Queue): ClientContextRTE<Document[]> => {
  switch (true) {
    case Schema.is(CreateQueueTextData)(job.data):
    case Schema.is(CreateEventFromTextQueueData)(job.data): {
      return loadText(job.data.text);
    }
    case Schema.is(CreateEventFromURLQueueData)(job.data):
    case Schema.is(CreateQueueURLData)(job.data): {
      if (job.resource === MEDIA.literals[0]) {
        return loadPDF(job.data.url);
      }

      return loadLinkWithPuppeteer(job.data.url);
    }
    case Schema.is(EVENTS)(job.resource): {
      return loadEventDocs(job);
    }

    case Schema.is(UpdateEventQueueData)(job.data): {
      return pipe(
        job.data.urls,
        fp.A.traverse(fp.RTE.ApplicativePar)((url) =>
          loadLinkWithPuppeteer(url),
        ),
        fp.RTE.map(fp.A.flatten),
        fp.RTE.map((arr) => [...arr]),
      );
    }

    default: {
      return fp.RTE.left(toAIBotError(new Error("Invalid job data")));
    }
  }
};
