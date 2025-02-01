import { type AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueURLData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Write a summary of the text.";

export const embedAndQuestionFlow: JobProcessRTE<CreateQueueURLData> =
  (job) => (ctx) => {
    return pipe(
      loadDocs(job)(ctx),
      fp.TE.chain((docs) =>
        fp.TE.tryCatch(async () => {
          return ctx.langchain.queryDocument(
            docs,
            job.question ?? defaultQuestion,
            {
              model: ctx.config.config.localAi.models
                ?.embeddings as AvailableModels,
              prompt:
                job.prompt ?? getPromptFromResource(job.resource, job.type),
            },
          );
        }, toAIBotError),
      ),
    );
  };
