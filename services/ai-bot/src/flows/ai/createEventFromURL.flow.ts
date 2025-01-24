import { type AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateEventFromURLQueueData } from "@liexp/shared/lib/io/http/Queue/CreateEventFromURLQueue.js";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "";

export const createEventFromURLFlow: JobProcessRTE<
  CreateEventFromURLQueueData
> = (job) => (ctx) => {
  return pipe(
    loadDocs(job)(ctx),
    fp.TE.chain((docs) =>
      fp.TE.tryCatch(() => {
        return ctx.langchain.createEventFromDocuments(
          docs,
          job.question ?? defaultQuestion,
          job.data.type,
          job.prompt ?? getPromptFromResource(job.resource, job.type),
          {
            model: ctx.config.config.localAi.models
              ?.embeddings as AvailableModels,
          },
        );
      }, toAIBotError),
    ),
    LoggerService.TE.debug(ctx, "`createEventFlow` result: %O"),
  );
};
