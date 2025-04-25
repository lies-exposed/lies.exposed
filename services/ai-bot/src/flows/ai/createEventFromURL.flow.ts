import { createEventFromDocuments } from "@liexp/backend/lib/flows/ai/createEventFromDocuments.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EventMap } from "@liexp/shared/lib/io/http/Events/index.js";
import { type CreateEventFromURLTypeData } from "@liexp/shared/lib/io/http/Queue/event/index.js";
import { JSONSchema, type Schema } from "effect";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getEventFromJsonPrompt } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion =
  "Can you extract an event similar to the one provided from the given text, please?";

export const createEventFromURLFlow: JobProcessRTE<
  CreateEventFromURLTypeData
> = (job) => {
  const eventSchema = EventMap[job.data.type];

  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bindW("jsonSchema", () =>
      pipe(
        JSONSchema.make(eventSchema as Schema.Schema<any, any>),
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
