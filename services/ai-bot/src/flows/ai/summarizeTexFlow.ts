import { type AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./loadDocs.flow.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

export const summarizeTextFlow: JobProcessRTE = (job) => (ctx) => {
  return pipe(
    loadDocs(job)(ctx),
    fp.TE.chain((docs) =>
      fp.TE.tryCatch(async () => {
        return ctx.langchain.summarizeText(docs, {
          model: ctx.config.config.localAi.models
            ?.summarization as AvailableModels,
          prompt:
            job.data.prompt ?? getPromptFromResource(job.resource, job.type),
          question: job.data.question,
        });
      }, toAIBotError),
    ),
  );
};
