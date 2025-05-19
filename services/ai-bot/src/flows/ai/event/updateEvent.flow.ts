import { updateEventFromDocuments } from "@liexp/backend/lib/flows/ai/updateEventFromDocuments.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type Event,
  EventMap,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { type UpdateEventTypeData } from "@liexp/shared/lib/io/http/Queue/event/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { JSONSchema, type Schema } from "effect";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { loadLinkWithPuppeteer } from "../common/loadLinkWithPuppeteer.flow.js";
import { loadText } from "../common/loadText.flow.js";
import { getEventFromJsonPrompt } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";
const defaultQuestion = "Can you give me an excerpt of the given documents?";

export const updateEventFlow: JobProcessRTE<UpdateEventTypeData, Event> = (
  job,
) => {
  const eventSchema = EventMap[job.data.type];

  return pipe(
    fp.RTE.Do,
    fp.RTE.bind(
      "event",
      () => (ctx: ClientContext) =>
        pipe(
          ctx.api.Event.Get({
            Params: { id: job.id },
          }),
          fp.TE.map((r) => r.data),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    fp.RTE.bind(
      "docs",
      ({ event }) =>
        (ctx) =>
          pipe(
            ctx.api.Link.List({
              Query: { ids: event.links },
            }),
            fp.TE.chain((links) =>
              pipe(
                links.data,
                fp.A.traverse(fp.TE.ApplicativePar)((l) => {
                  const description = l.description;
                  if (description) {
                    return loadText(description)(ctx);
                  }
                  return loadLinkWithPuppeteer(l.url)(ctx);
                }),
                fp.TE.map(fp.A.flatten),
                fp.TE.map((docs) => [...docs]),
              ),
            ),
          ),
    ),
    fp.RTE.bindW("jsonSchema", () =>
      pipe(
        JSONSchema.make(eventSchema as Schema.Schema<unknown>),
        fp.RTE.right,
        LoggerService.RTE.debug((s) => [
          `Event JSON Schema ${JSON.stringify(s, null, 2)}`,
        ]),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getEventFromJsonPrompt(job.type));
    }),
    fp.RTE.bindW("aiEvent", ({ docs, prompt, jsonSchema }) =>
      pipe(
        updateEventFromDocuments(
          docs,
          job.data.type,
          prompt,
          jsonSchema,
          job.question ?? defaultQuestion,
        ),
      ),
    ),
    fp.RTE.map(({ event, aiEvent }) =>
      pipe({
        ...event,
        id: job.id,
        excerpt: toInitialValue(aiEvent.excerpt),
        body: null,
        links: [],
        keywords: [],
        media: [],
        socialPosts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        draft: true,
      } as Event),
    ),
  );
};
