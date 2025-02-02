import { createEventFromDocuments } from "@liexp/backend/lib/flows/ai/createEventFromDocuments.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateEventFromURLQueueData } from "@liexp/shared/lib/io/http/Queue/CreateEventFromURLQueue.js";
import { getEventArbitrary } from "@liexp/shared/lib/tests/arbitrary/events/index.arbitrary.js";
import { fc } from "@liexp/test/lib/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion =
  "Can you extract an event similar to the one provided from the given text, please?";

export const createEventFromURLFlow: JobProcessRTE<
  CreateEventFromURLQueueData
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bindW("jsonSchema", () =>
      pipe(
        fc.sample(getEventArbitrary(job.data.type), 1)[0],
        fp.RTE.right,
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.chainW(({ docs, jsonSchema }) =>
      createEventFromDocuments(
        docs,
        job.data.type,
        job.prompt ?? getPromptFromResource(job.resource, job.type),
        jsonSchema,
        job.question ?? defaultQuestion,
      ),
    ),
    fp.RTE.map((event) => JSON.stringify(event)),
    LoggerService.RTE.debug("`createEventFlow` result: %O"),
  );
};
