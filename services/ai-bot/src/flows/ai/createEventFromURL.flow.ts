import { createEventFromDocuments } from "@liexp/backend/lib/flows/ai/createEventFromDocuments.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateEventFromURLTypeData } from "@liexp/shared/lib/io/http/Queue/event/index.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import { fc } from "@liexp/test/lib/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getEventFromJsonPrompt } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion =
  "Can you extract an event similar to the one provided from the given text, please?";

export const createEventFromURLFlow: JobProcessRTE<
  CreateEventFromURLTypeData
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bindW("jsonSchema", () =>
      pipe(
        fc.sample(getEventArbitrary(job.data.type), 1)[0],
        fp.RTE.right,
        fp.RTE.map((event) => ({
          ...event,
          type: job.data.type,
          media: [],
          keywords: [],
          links: [],
        })),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getEventFromJsonPrompt(job.type));
    }),
    fp.RTE.chainW(({ docs, prompt, jsonSchema }) =>
      createEventFromDocuments(
        docs,
        job.data.type,
        prompt,
        jsonSchema,
        job.question ?? defaultQuestion,
      ),
    ),
    LoggerService.RTE.debug("`createEventFlow` result: %O"),
    fp.RTE.map((event) => JSON.stringify(event)),
  );
};
