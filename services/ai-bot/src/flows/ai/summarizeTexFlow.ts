import { type AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueTextTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

export const summarizeTextFlow: JobProcessRTE<CreateQueueTextTypeData> = (
  job,
) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),

    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getPromptFromResource(job.resource, job.type));
    }),
    fp.RTE.chain(
      ({ docs, prompt }) =>
        (ctx) =>
          fp.TE.tryCatch(() => {
            return ctx.langchain.summarizeText(docs, {
              model: ctx.config.config.localAi.models
                ?.summarization as AvailableModels,
              prompt,
              question: job.question ?? undefined,
            });
          }, toAIBotError),
    ),
  );
};
